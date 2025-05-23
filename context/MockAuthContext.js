// context/MockAuthContext.js - Use this for testing without Supabase
import React, { createContext, useContext, useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(true);

  const signIn = async (email, password) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    const mockUser = {
      id: '123',
      email: email,
      user_metadata: { name: 'Test User' }
    };
    
    setUser(mockUser);
    setLoading(false);
    
    console.log('Mock sign in successful');
    return { data: { user: mockUser }, error: null };
  };

  const signUp = async (email, password, additionalData = {}) => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful signup
    const mockUser = {
      id: '123',
      email: email,
      user_metadata: { name: additionalData.name || 'Test User' }
    };
    
    setUser(mockUser);
    setLoading(false);
    
    console.log('Mock sign up successful');
    return { data: { user: mockUser }, error: null };
  };

  const signOut = async () => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    setLoading(false);
    
    console.log('Mock sign out successful');
    return { error: null };
  };

  const value = {
    user,
    loading,
    initialized,
    isLoggedIn: !!user,
    signIn,
    signUp,
    signOut,
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