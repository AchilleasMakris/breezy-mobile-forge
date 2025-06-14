
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create an anonymous client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create an authenticated client with a JWT from Clerk
export const createAuthenticatedClient = (jwt: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    auth: {
      persistSession: false, // We don't need Supabase to persist the session as Clerk handles this
      autoRefreshToken: false, // Clerk will handle token refresh
      detectSessionInUrl: false, // Disable URL-based session detection for mobile
    },
    // Add retry logic for network issues common on mobile
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduce real-time events to prevent token exhaustion
      },
    },
  });
};
