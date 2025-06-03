// lib/supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://oybnbjuejajwdwfhtzje.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95Ym5ianVlamFqd2R3Zmh0emplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NzE4NzEsImV4cCI6MjA2MzU0Nzg3MX0.w-LpJtrpXTQaskFI78o-od0ejSOklybZWlCs67FfsbQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic token refresh for simplicity
    autoRefreshToken: false,
    // Persist auth session in AsyncStorage
    persistSession: true,
    // Use AsyncStorage for session storage
    storage: require('@react-native-async-storage/async-storage').default,
  },
});

// Helper functions for common operations
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};

// Database helpers for your app's features
export const dbHelpers = {
  // Chat/Messages related functions
  createChat: async (chatData) => {
    const { data, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select();
    return { data, error };
  },

  getChats: async (userId) => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Gallery related functions
  uploadImage: async (file, fileName) => {
    const { data, error } = await supabase.storage
      .from('gallery')
      .upload(fileName, file);
    return { data, error };
  },

  getImages: async (userId) => {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Calendar/Events related functions
  createEvent: async (eventData) => {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    return { data, error };
  },

  getEvents: async (userId) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });
    return { data, error };
  },

  // Classes related functions
  getClasses: async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  enrollInClass: async (userId, classId) => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .insert([{ user_id: userId, class_id: classId }])
      .select();
    return { data, error };
  },
};