// NativeGoogleAuth.js - Fixed version
import { useState, useEffect } from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export function useNativeGoogleAuth() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Only configure on Android 
  useEffect(() => {
    if (Platform.OS === 'android') {
      console.log('Configuring Native Google Sign-In');
      
      // IMPORTANT: Configure with the correct webClientId
      // This should be the OAuth client ID of type "Web application"
      GoogleSignin.configure({
        webClientId: '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com',
        offlineAccess: false, // Set to false to simplify the flow
        hostedDomain: '', // Set to empty string, don't restrict to specific domain
        forceCodeForRefreshToken: false, // Set to false to use standard flow
      });
      
      console.log('Native Google Sign-In configured');
    }

    checkLocalUserInfo();
  }, []);
  
  const checkLocalUserInfo = async () => {
    console.log("Checking AsyncStorage for stored user...");
    setIsLoading(true);
    try {
      const userData = await AsyncStorage.getItem('userInfo');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserInfo(parsedUserData);
        setIsLoggedIn(true);
        console.log("User loaded from AsyncStorage");
      } else {
        console.log("No user found in AsyncStorage.");
      }
    } catch (error) {
      console.error('Error retrieving stored user data:', error);
    }
    setIsLoading(false);
  };

  const signIn = async () => {
    if (Platform.OS !== 'android') {
      console.warn('Native Google Sign-In is only supported on Android');
      return;
    }
    
    setIsLoading(true);
    try {
      // Clear any existing stored data before signing in
      await AsyncStorage.removeItem('userInfo');
      
      console.log("Starting native sign-in process");
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log("Play services available");
      
      // Sign in with Google
      const result = await GoogleSignin.signIn();
      console.log("Sign in successful:", result.user.email);
      
      // Set the user info from the result
      setUserInfo(result.user);
      setIsLoggedIn(true);
      
      // Store user data in AsyncStorage for persistence
      await AsyncStorage.setItem('userInfo', JSON.stringify(result.user));
      console.log("User data stored successfully");
    } catch (error) {
      console.error('Native sign in error:', error);
      let errorMessage = 'Unknown error occurred';
      
      // Handle specific error codes
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation in progress already');
        errorMessage = 'Sign in already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
        errorMessage = 'Google Play Services not available or outdated';
      } else {
        console.log('Other error:', error.message);
        errorMessage = error.message || 'Failed to sign in with Google';
      }
      
      Alert.alert('Sign In Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
      
      if (Platform.OS === 'android') {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      
      await AsyncStorage.removeItem('userInfo');
      setUserInfo(null);
      setIsLoggedIn(false);
      console.log("Sign out complete");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    userInfo,
    isLoggedIn,
    isLoading,
    signIn,
    signOut
  };
}