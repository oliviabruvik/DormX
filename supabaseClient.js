// supabaseClient.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// URL and anon key from your Supabase project
const supabaseUrl = 'https://ojridmbyqwbbondescsj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcmlkbWJ5cXdiYm9uZGVzY3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzExNzgsImV4cCI6MjA2Mjg0NzE3OH0.kpZt2jUjcGB6EjUa1lzl_NJkL_yVxIH6SyiliGO1rok';

// Common options for all platforms
const commonOptions = {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  };
  
  // Platform-specific options
  const platformOptions = Platform.OS === 'web'
    ? {
        auth: {
          ...commonOptions.auth,
          detectSessionInUrl: true,
        },
      }
    : {
        auth: {
          ...commonOptions.auth,
          detectSessionInUrl: false,
        },
        // For Android, only disable realtime (WebSockets) as we still need the auth functionality
        realtime: {
          params: {
            eventsPerSecond: 0,
          },
        },
      };
  
  // Create and export the Supabase client
  export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      ...commonOptions,
      ...platformOptions,
    }
  );