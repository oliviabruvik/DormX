// AuthContext.js - For Google Sign-In
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Create the context
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('Platform:', Platform.OS);

  // Check for session on mount
  useEffect(() => {
    checkUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Supabase auth event: ${event}`);
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    // Clean up the subscription
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Check for existing user session
  async function checkUser() {
    try {
      setLoading(true);
      
      // Get the current session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user || null);
      
      console.log('User checked:', data.session?.user?.email || 'No active session');
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }

  // Sign in with email + password
  async function signInWithEmail(email, password) {
    setLoading(true);
    try {
      console.log('Signing in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Sign in successful');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error signing in', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  // Sign in with Google (Web method)
  async function signInWithGoogle() {
    setLoading(true);
    try {
      console.log('Signing in with Google');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'web' ? undefined : 'myapp://auth/callback',
        },
      });
      
      if (error) throw error;
      
      console.log('Google sign in initiated');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      Alert.alert('Error signing in with Google', error.message);
      return { data: null, error };
    } finally {
      // For web, we don't set loading to false immediately, as we expect a redirect
      if (Platform.OS !== 'web') {
        setLoading(false);
      }
    }
  }

  // Handle Google Sign-In result from native component
  function handleGoogleSignInResult(userData) {
    console.log('Handling Google sign-in result');
    setLoading(false);
    
    if (userData) {
      // The user data should already be in the session via the onAuthStateChange listener
      checkUser(); // Refresh to be sure
    }
  }

  // Sign up with email + password
  async function signUpWithEmail(email, password) {
    setLoading(true);
    try {
      console.log('Signing up with email:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log('Sign up successful');
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error signing up', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }

  // Sign out
  async function signOut() {
    setLoading(true);
    try {
      console.log('Signing out');
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Reset state (this should also happen via onAuthStateChange)
      setUser(null);
      setSession(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error signing out', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Use dev bypass for testing
  async function enableDevBypass() {
    console.log('Enabling dev bypass');
    const mockUser = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      user_metadata: {
        name: 'Development User',
        avatar_url: null,
      },
    };
    
    setUser(mockUser);
    setSession({ user: mockUser, access_token: 'fake-token' });
    await AsyncStorage.setItem('devBypassEnabled', 'true');
    await AsyncStorage.setItem('userInfo', JSON.stringify(mockUser));
    console.log('Dev bypass enabled');
  }

  // Context value
  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    handleGoogleSignInResult,
    signUpWithEmail,
    signOut,
    enableDevBypass,
  };

  // Provide the context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};