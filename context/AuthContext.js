// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase, authHelpers } from '../lib/supabase';

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

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { session, error } = await authHelpers.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          setUser(session.user);
          console.log('User authenticated:', session.user.email);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      // Check if we're in simulator (this is a heuristic)
      const isSimulator = __DEV__ && Platform.OS === 'ios';
      
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Handle network errors gracefully in simulator
        if (error.message?.includes('Network request failed') && isSimulator) {
          console.log('🔧 DEV: Network error in simulator, creating mock session...');
          
          // Create a mock user for development in simulator
          const mockUser = {
            id: `dev-${Date.now()}`,
            email: email,
            user_metadata: { 
              name: email.split('@')[0] || 'Dev User' 
            },
            created_at: new Date().toISOString()
          };
          
          // Set the mock user
          setUser(mockUser);
          
          console.log('🔧 DEV: Mock sign in successful for simulator:', email);
          return { 
            data: { 
              user: mockUser, 
              session: { access_token: 'dev-token' } 
            } 
          };
        }
        
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.email);
      return { data };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      
      // Handle network errors in simulator
      const isSimulator = __DEV__ && Platform.OS === 'ios';
      if (error.message?.includes('Network request failed') && isSimulator) {
        console.log('🔧 DEV: Catch block - Network error in simulator, creating mock session...');
        
        const mockUser = {
          id: `dev-${Date.now()}`,
          email: email,
          user_metadata: { 
            name: email.split('@')[0] || 'Dev User' 
          },
          created_at: new Date().toISOString()
        };
        
        setUser(mockUser);
        
        return { 
          data: { 
            user: mockUser, 
            session: { access_token: 'dev-token' } 
          } 
        };
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      
      // Check if we're in simulator
      const isSimulator = __DEV__ && Platform.OS === 'ios';
      
      const { data, error } = await authHelpers.signUp(email, password);
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Handle network errors gracefully in simulator
        if (error.message?.includes('Network request failed') && isSimulator) {
          console.log('🔧 DEV: Network error in simulator during signup, creating mock user...');
          
          // Create a mock user for development
          const mockUser = {
            id: `dev-${Date.now()}`,
            email: email,
            user_metadata: { 
              name: additionalData.name || email.split('@')[0] || 'Dev User',
              ...additionalData
            },
            created_at: new Date().toISOString()
          };
          
          // Set the mock user (auto sign them in)
          setUser(mockUser);
          
          console.log('🔧 DEV: Mock sign up successful for simulator:', email);
          return { 
            data: { 
              user: mockUser, 
              session: { access_token: 'dev-token' } 
            } 
          };
        }
        
        return { error };
      }

      // If sign up successful and we have additional user data, save it
      if (data.user && Object.keys(additionalData).length > 0) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                ...additionalData,
                created_at: new Date().toISOString(),
              }
            ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        } catch (profileError) {
          console.error('Unexpected profile creation error:', profileError);
        }
      }
      
      console.log('Sign up successful:', data.user?.email);
      return { data };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      
      // Handle network errors in simulator
      const isSimulator = __DEV__ && Platform.OS === 'ios';
      if (error.message?.includes('Network request failed') && isSimulator) {
        console.log('🔧 DEV: Catch block - Network error in simulator during signup...');
        
        const mockUser = {
          id: `dev-${Date.now()}`,
          email: email,
          user_metadata: { 
            name: additionalData.name || email.split('@')[0] || 'Dev User',
            ...additionalData
          },
          created_at: new Date().toISOString()
        };
        
        setUser(mockUser);
        
        return { 
          data: { 
            user: mockUser, 
            session: { access_token: 'dev-token' } 
          } 
        };
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Check if we're in simulator (this is a heuristic)
      const isSimulator = __DEV__ && Platform.OS === 'ios';
      
      if (isSimulator) {
        console.log('Detected simulator, using local signout...');
        // Just clear local state for simulator
        setUser(null);
        // Try to clear any stored tokens
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.clear();
        } catch (e) {
          console.log('AsyncStorage clear failed:', e);
        }
        console.log('Local sign out successful');
        return { success: true };
      }
      
      // Regular signout for real devices
      const { error } = await authHelpers.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        
        // If network error, still clear local state
        if (error.message?.includes('Network request failed')) {
          console.log('Network error, clearing local state anyway...');
          setUser(null);
          return { success: true };
        }
        
        return { error };
      }
      
      setUser(null);
      console.log('Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      
      // Always clear local state as fallback
      setUser(null);
      return { success: true }; // Don't show error to user for signout
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    isLoggedIn: !!user,
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