// lib/supabase-debug.js - Debug version to test connection
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://utaqsfrzkuoidnyfwgni.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0YXFzZnJ6a3VvaWRueWZ3Z25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NzA3NDUsImV4cCI6MjA2MzU0Njc0NX0.eJie1jzYIQlajU_kcqf8Hb284KOfrgATmY0VfgNw-QQ';

// Debug function to test configuration
export const debugSupabase = () => {
  console.log('=== SUPABASE DEBUG INFO ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
  console.log('URL is valid:', supabaseUrl.includes('supabase.co'));
  console.log('Key is valid length:', supabaseAnonKey.length > 100);
  console.log('=== END DEBUG INFO ===');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Simple health check
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);
    
    console.log('Connection test result:', { data, error });
    return { success: !error, error };
  } catch (err) {
    console.error('Connection test failed:', err);
    return { success: false, error: err };
  }
};

// Enhanced auth helpers with better error logging
export const authHelpers = {
  signUp: async (email, password) => {
    try {
      console.log('Attempting sign up for:', email);
      console.log('Supabase URL being used:', supabaseUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      console.log('Sign up response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasError: !!error,
        errorMessage: error?.message,
        errorDetails: error,
      });
      
      return { data, error };
    } catch (err) {
      console.error('Sign up catch error:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      return { data: null, error: err };
    }
  },

  signIn: async (email, password) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasError: !!error,
        errorMessage: error?.message,
      });
      
      return { data, error };
    } catch (err) {
      console.error('Sign in catch error:', err);
      return { data: null, error: err };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { hasError: !!error });
      return { error };
    } catch (err) {
      console.error('Sign out catch error:', err);
      return { error: err };
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Get current user result:', { hasUser: !!user, hasError: !!error });
      return { user, error };
    } catch (err) {
      console.error('Get current user catch error:', err);
      return { user: null, error: err };
    }
  },

  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Get session result:', { hasSession: !!session, hasError: !!error });
      return { session, error };
    } catch (err) {
      console.error('Get session catch error:', err);
      return { session: null, error: err };
    }
  },
};