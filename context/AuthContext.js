// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      console.log('Profile fetched:', profile);
      setUserProfile(profile);

      const needsOnboarding = !profile.onboarding_completed;
      console.log('User needs onboarding:', needsOnboarding);
      setNeedsOnboarding(needsOnboarding);
      return profile;
  
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { session, error } = await authHelpers.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          console.log('User authenticated on init:', session.user.email);
          setUser(session.user);
          
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No authenticated user on init');
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
          
          if (event === 'SIGNED_UP') {
            console.log('Fresh signup detected - will need onboarding');
            // For fresh signups, don't fetch profile yet - wait for onboarding
            await fetchUserProfile(session.user.id);
          } else if (event === 'SIGNED_IN') {
            console.log('User signed in - fetching profile');
            await fetchUserProfile(session.user.id);
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed');
            // Don't refetch profile on token refresh if we already have it
            if (!userProfile) {
              await fetchUserProfile(session.user.id);
            }
          }
        } else {
          console.log('User signed out');
          setUser(null);
          setUserProfile(null);
          setNeedsOnboarding(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialized]);


  const completeOnboarding = async (onboardingData) => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('No user found');
      }

      console.log('Completing onboarding for user:', user.id);
      
      // Create the profile for the first time
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          id: user.id,
          name: onboardingData.displayName.trim(),
          bio: onboardingData.bio?.trim() || null,
          avatar_url: onboardingData.profileImageUrl,
          is_ra: onboardingData.isRA,
          dorm_name: onboardingData.dormBuilding.trim(),
          room_number: onboardingData.roomNumber?.trim() || null,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id); 

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error('Failed to create profile');
      }
      // Fetch the newly created profile
      await fetchUserProfile(user.id);
      
      console.log('Onboarding completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };
  

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await authHelpers.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.email);
      return { data };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await authHelpers.signUp(email, password);
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
            
      console.log('Sign up successful:', data.user?.email);
      return { data };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authHelpers.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }
      
      setUser(null);
      setUserProfile(null);
      setNeedsOnboarding(false);
      console.log('Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Determine if user is fully authenticated (has completed onboarding)
  const isFullyAuthenticated = !!user && !!userProfile && !needsOnboarding;

  const value = {
    user,
    userProfile,
    loading,
    initialized,
    needsOnboarding,
    isLoggedIn: !!user,
    isFullyAuthenticated,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
    fetchUserProfile,
    // Helper to get user info
    userInfo: user && userProfile ? {
      id: user.id,
      email: user.email,
      name: userProfile.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      ...userProfile,
      ...user.user_metadata,
    } : user ? {
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