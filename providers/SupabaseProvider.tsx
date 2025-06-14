
import { useAuth } from '@clerk/clerk-expo';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createAuthenticatedClient } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Define the type for our context to hold the Supabase client
type SupabaseContextType = {
  supabase: SupabaseClient | null;
  loading: boolean;
};

// Create the context with a default value
const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  loading: true,
});

// Create a custom hook to easily access the context
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

// This provider's role is to create and manage an authenticated Supabase client.
export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken, isSignedIn } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const decodeExp = (jwt: string): number | null => {
    try {
      const payload = jwt.split('.')[1];
      if (!payload) return null;
      
      const paddedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(paddedPayload));
      return decoded.exp ? decoded.exp * 1000 : null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const createOrUpdateClient = async (token: string) => {
    if (token === tokenRef.current) return; // Don't update if token hasn't changed
    
    console.log('Creating/updating Supabase client with new token');
    tokenRef.current = token;
    
    try {
      if (supabase) {
        // Update existing client's session
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '', // We don't need a refresh token as Clerk handles this
        });
      } else {
        // Create a new client
        const client = createAuthenticatedClient(token);
        setSupabase(client);
      }
    } catch (error) {
      console.error('Error updating Supabase client:', error);
    }
  };

  const scheduleRefresh = (expiryMs: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    const now = Date.now();
    const timeUntilExpiry = expiryMs - now;
    
    // Refresh 5 minutes before expiry for mobile reliability, but at least 30 seconds
    const refreshDelay = Math.max(timeUntilExpiry - 5 * 60 * 1000, 30 * 1000);
    
    console.log(`Scheduling token refresh in ${Math.round(refreshDelay / 1000)} seconds`);
    
    refreshTimerRef.current = setTimeout(() => {
      console.log('Scheduled refresh triggered');
      refreshToken(true);
    }, refreshDelay);
  };

  const refreshToken = async (skipCache = false) => {
    if (!isSignedIn || isRefreshingRef.current) {
      console.log('Skipping refresh: not signed in or already refreshing');
      return;
    }
    
    isRefreshingRef.current = true;
    
    try {
      console.log('Refreshing token, skipCache:', skipCache);
      const token = await getToken({ template: 'supabase-final', skipCache });
      
      if (!token) {
        console.log('No token received from Clerk');
        return;
      }
      
      await createOrUpdateClient(token);
      
      // Schedule next refresh based on token expiry
      const expMs = decodeExp(token);
      if (expMs) {
        console.log('Token expires at:', new Date(expMs));
        scheduleRefresh(expMs);
      } else {
        // If we can't decode expiry, refresh in 45 minutes as fallback
        console.log('Could not decode token expiry, scheduling fallback refresh');
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => refreshToken(true), 45 * 60 * 1000);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Retry with exponential backoff
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => refreshToken(true), 30 * 1000);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // Initialize Supabase client when auth state changes
  useEffect(() => {
    console.log('Auth state changed, isSignedIn:', isSignedIn);
    setLoading(true);
    
    if (isSignedIn) {
      refreshToken(false); // Initial fetch uses cache if available
    } else {
      console.log('User signed out, clearing Supabase client');
      setSupabase(null);
      tokenRef.current = null;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
    
    setLoading(false);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isSignedIn]);

  // Refresh token when app comes to foreground (critical for mobile)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      console.log('App state changed to:', state);
      if (state === 'active' && isSignedIn) {
        console.log('App became active, forcing token refresh');
        refreshToken(true); // Force fresh token when app becomes active
      }
    });

    return () => subscription.remove();
  }, [isSignedIn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      supabase,
      loading,
    }),
    [supabase, loading]
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
