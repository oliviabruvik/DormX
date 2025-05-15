// supabaseConfig.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Get Supabase URL and anon key from various sources with fallbacks
let supabaseUrl = 'https://ojridmbyqwbbondescsj.supabase.co';
let supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcmlkbWJ5cXdiYm9uZGVzY3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzExNzgsImV4cCI6MjA2Mjg0NzE3OH0.kpZt2jUjcGB6EjUa1lzl_NJkL_yVxIH6SyiliGO1rok';

try {
  // Try to get from Constants
  if (Constants.expoConfig?.extra?.supabaseUrl) {
    supabaseUrl = Constants.expoConfig.extra.supabaseUrl;
  }
  
  if (Constants.expoConfig?.extra?.supabaseAnonKey) {
    supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey;
  }
  
  // If not in Constants, try environment variables
  if (!supabaseUrl && process.env.SUPABASE_URL) {
    supabaseUrl = process.env.SUPABASE_URL;
  }
  
  if (!supabaseAnonKey && process.env.SUPABASE_ANON_KEY) {
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  }
  
  // If still not found, try to get from environment
  if (!supabaseUrl) {
    console.warn('Supabase URL not found, using fallback');
    supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
  }
  
  if (!supabaseAnonKey) {
    console.warn('Supabase anon key not found, using fallback');
    supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual key
  }
} catch (error) {
  console.error('Error setting up Supabase config:', error);
  // Use fallbacks
  supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your actual URL 
  supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual key
}

// Log the configuration (be careful not to expose in production)
if (__DEV__) {
  console.log('Supabase URL:', supabaseUrl.substring(0, 15) + '...');
  console.log('Supabase Key:', supabaseAnonKey.substring(0, 5) + '...');
}

// Custom storage implementation for Supabase
const supabaseStorage = {
  getItem: (key) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key, value) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key) => {
    return AsyncStorage.removeItem(key);
  },
};

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get user profile from Supabase
export async function getUserProfile(userId) {
  if (!userId) {
    console.log('getUserProfile: No user ID provided');
    return null;
  }
  
  try {
    console.log(`Getting profile for user: ${userId.substring(0, 5)}...`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      // If the error is because the profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        console.log('Profile not found, will create one');
        return null;
      }
      
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    console.log('Profile retrieved successfully');
    return data;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
}

// Helper function to create or update user profile
export async function upsertUserProfile(userInfo) {
  if (!userInfo || !userInfo.id) {
    console.error('Cannot upsert profile: Invalid user info');
    return null;
  }
  
  try {
    const updates = {
      id: userInfo.id,
      email: userInfo.email || '',
      name: userInfo.name || '',
      avatar_url: userInfo.photo || userInfo.avatar_url || userInfo.picture,
      updated_at: new Date(),
    };
    
    console.log(`Upserting profile for user: ${userInfo.id.substring(0, 5)}...`);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates)
      .select();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    console.log('Profile upserted successfully');
    return data;
  } catch (error) {
    console.error('Exception upserting user profile:', error);
    return null;
  }
}

// Function to sign out from Supabase
export async function signOutFromSupabase() {
  try {
    console.log('Signing out from Supabase');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out from Supabase:', error);
      return false;
    }
    
    console.log('Successfully signed out from Supabase');
    return true;
  } catch (error) {
    console.error('Exception during Supabase sign out:', error);
    return false;
  }
}

// Function to get the current Supabase session
export async function getSupabaseSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting Supabase session:', error);
      return null;
    }
    
    return data.session;
  } catch (error) {
    console.error('Exception getting Supabase session:', error);
    return null;
  }
}