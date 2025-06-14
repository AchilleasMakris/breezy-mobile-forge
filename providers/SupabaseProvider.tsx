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

  const decodeExp = (jwt: string): number | null => {
    try {
      const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      return decoded.exp ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  };

  const createOrUpdateClient = async (token: string) => {
    if (token === tokenRef.current) return; // Don't update if token hasn't changed
    
    tokenRef.current = token;
    
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
  };

  const scheduleRefresh = (expiryMs: number) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    
    // Refresh 2 minutes before expiry, clamp between 1–10 minutes
    const now = Date.now();
    const timeUntilExpiry = expiryMs - now;
    const refreshDelay = Math.min(Math.max(timeUntilExpiry - 2 * 60 * 1000, 60 * 1000), 10 * 60 * 1000);
    
    refreshTimerRef.current = setTimeout(() => refreshToken(true), refreshDelay);
  };

  const refreshToken = async (skipCache = false) => {
    if (!isSignedIn) return;
    
    try {
      const token = await getToken({ template: 'supabase-final', skipCache });
      if (!token) return;
      
      await createOrUpdateClient(token);
      
      // Schedule next refresh based on token expiry
      const expMs = decodeExp(token);
      if (expMs) scheduleRefresh(expMs);
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Still schedule a retry even if this attempt failed
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => refreshToken(true), 60 * 1000); // Retry after 1 minute
    }
  };

  // Initialize Supabase client when auth state changes
  useEffect(() => {
    setLoading(true);
    
    if (isSignedIn) {
      refreshToken(false); // Initial fetch uses cache if available
    } else {
      setSupabase(null);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    }
    
    setLoading(false);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [isSignedIn]);

  // Refresh token when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isSignedIn) {
        refreshToken(true); // Force fresh token when app becomes active
      }
    });

    return () => subscription.remove();
  }, [isSignedIn]);

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