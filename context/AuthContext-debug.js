// context/AuthContext-debug.js - Debug version for simulator issues
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers } from '../lib/supabase-simulator-fix';
import { Alert } from 'react-native';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('testing');

  // Test connection on startup
  useEffect(() => {
    const testConnection = async () => {
      console.log('🔍 Testing Supabase connection...');
      const result = await authHelpers.testConnection();
      
      if (result.connected) {
        console.log('✅ Supabase connection successful');
        setConnectionStatus('connected');
      } else {
        console.log('❌ Supabase connection failed:', result.error);
        setConnectionStatus('failed');
        Alert.alert(
          'Connection Error',
          'Unable to connect to the authentication server. Please check your internet connection and Supabase configuration.',
          [{ text: 'OK' }]
        );
      }
    };

    testConnection();
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      if (connectionStatus !== 'connected') {
        console.log('⏳ Waiting for connection before initializing auth...');
        return;
      }

      try {
        console.log('🚀 Initializing authentication...');
        setLoading(true);
        
        // Get initial session
        const { session, error } = await authHelpers.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        } else if (session?.user) {
          console.log('✅ User authenticated:', session.user.email);
          setUser(session.user);
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();
  }, [connectionStatus]);

  // Listen for auth changes (only if connected)
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    console.log('👂 Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (session?.user) {
          console.log('✅ User signed in:', session.user.email);
          setUser(session.user);
        } else {
          console.log('👋 User signed out');
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth listener...');
      subscription?.unsubscribe();
    };
  }, [connectionStatus]);

  const signIn = async (email, password) => {
    if (connectionStatus !== 'connected') {
      return { 
        error: { message: 'Not connected to authentication server' } 
      };
    }

    try {
      console.log('🔐 Attempting sign in...');
      setLoading(true);
      
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        console.error('❌ Sign in error:', error);
        return { error };
      }
      
      console.log('✅ Sign in successful');
      return { data };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return { error: { message: 'Unexpected error during sign in' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    if (connectionStatus !== 'connected') {
      return { 
        error: { message: 'Not connected to authentication server' } 
      };
    }

    try {
      console.log('📝 Attempting sign up...');
      setLoading(true);
      
      const { data, error } = await authHelpers.signUp(email, password);
      
      if (error) {
        console.error('❌ Sign up error:', error);
        return { error };
      }

      console.log('✅ Sign up successful');
      return { data };
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      return { error: { message: 'Unexpected error during sign up' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Attempting sign out...');
      setLoading(true);
      
      const { error } = await authHelpers.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return { error };
      }
      
      setUser(null);
      console.log('✅ Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Unexpected sign out error:', error);
      return { error: { message: 'Unexpected error during sign out' } };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    isLoggedIn: !!user,
    connectionStatus,
    signIn,
    signUp,
    signOut,
    // Helper to get user info
    userInfo: user ? {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      ...user.user_metadata,
    } : null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};