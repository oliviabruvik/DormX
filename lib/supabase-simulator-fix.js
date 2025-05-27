// lib/supabase-simulator-fix.js - Fixed for React Native Simulator
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://oybnbjuejajwdwfhtzje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Ym5ianVlamFqd2R3Zmh0emplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NzE4NzEsImV4cCI6MjA2MzU0Nzg3MX0.w-LpJtrpXTQaskFI78o-od0ejSOklybZWlCs67FfsbQ';

// Custom fetch function to handle simulator issues
const customFetch = (url, options = {}) => {
  console.log('Making request to:', url);
  console.log('With options:', { ...options, body: options.body ? '[REDACTED]' : undefined });
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  }).then(response => {
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    return response;
  }).catch(error => {
    console.error('Fetch error:', error);
    throw error;
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Add debug logging
    debug: true,
  },
  global: {
    // Use custom fetch
    fetch: customFetch,
  },
  // Disable realtime to avoid WebSocket simulator issues
  realtime: {
    params: {
      eventsPerSecond: -1,
    },
  },
});

// Enhanced auth helpers with better error handling
export const authHelpers = {
  // Test connection first
  testConnection: async () => {
    try {
      console.log('Testing Supabase connection...');
      const response = await customFetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': supabaseAnonKey,
        },
      });
      console.log('Connection test result:', response.ok);
      return { connected: response.ok, error: null };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { connected: false, error };
    }
  },

  // Sign up with enhanced error handling
  signUp: async (email, password) => {
    try {
      console.log('Attempting sign up for:', email);
      
      // Test connection first
      const connectionTest = await authHelpers.testConnection();
      if (!connectionTest.connected) {
        return { 
          data: null, 
          error: { message: 'Unable to connect to authentication server' } 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      console.log('SignUp result:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasError: !!error,
        errorMessage: error?.message 
      });
      
      return { data, error };
    } catch (err) {
      console.error('SignUp catch error:', err);
      return { 
        data: null, 
        error: { message: 'Network error during sign up. Please check your connection.' }
      };
    }
  },

  // Sign in with enhanced error handling
  signIn: async (email, password) => {
    try {
      console.log('Attempting sign in for:', email);
      
      // Test connection first
      const connectionTest = await authHelpers.testConnection();
      if (!connectionTest.connected) {
        return { 
          data: null, 
          error: { message: 'Unable to connect to authentication server' } 
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('SignIn result:', { 
        hasData: !!data, 
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        hasError: !!error,
        errorMessage: error?.message 
      });
      
      return { data, error };
    } catch (err) {
      console.error('SignIn catch error:', err);
      return { 
        data: null, 
        error: { message: 'Network error during sign in. Please check your connection.' }
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('Attempting sign out...');
      const { error } = await supabase.auth.signOut();
      console.log('SignOut result:', { hasError: !!error, errorMessage: error?.message });
      return { error };
    } catch (err) {
      console.error('SignOut catch error:', err);
      return { error: { message: 'Error during sign out' } };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('Getting current user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('GetCurrentUser result:', { 
        hasUser: !!user, 
        userEmail: user?.email,
        hasError: !!error,
        errorMessage: error?.message 
      });
      return { user, error };
    } catch (err) {
      console.error('GetCurrentUser catch error:', err);
      return { user: null, error: err };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      console.log('Getting current session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('GetSession result:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        hasError: !!error,
        errorMessage: error?.message 
      });
      return { session, error };
    } catch (err) {
      console.error('GetSession catch error:', err);
      return { session: null, error: err };
    }
  },
};
