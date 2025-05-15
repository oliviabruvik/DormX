// WebAuth.js - Fixed export
import React, { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Register the redirect handler
WebBrowser.maybeCompleteAuthSession();

// Fixed export - this should match what Auth.js expects
export function useWebGoogleAuth() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('Using Web Google Auth mechanism');
  
  // Web client ID only needed for web platform
  const webClientId = '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com';
  
  // Use the web approach
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId,
    expoClientId: webClientId,
    // No need for other client IDs as this is web only
    responseType: "token",
    scopes: ['profile', 'email'],
  });
  
  useEffect(() => {
    checkLocalUserInfo();
  }, []);

  useEffect(() => {
    console.log('OAuth response:', response ? JSON.stringify(response, null, 2) : null);
    
    if (response?.type === 'success') {
      handleSignInResponse(response);
    } else if (response?.type === 'error') {
      console.error('Auth Error Details:', response.error);
      Alert.alert(
        "Authentication Error", 
        `Error: ${response.error?.description || response.error?.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
      setIsLoading(false);
    } else if (response?.type === 'dismiss') {
      console.log('Authentication was dismissed');
      setIsLoading(false);
    }
  }, [response]);

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

  const handleSignInResponse = async (response) => {
    setIsLoading(true);
    try {
      console.log("Handling sign-in response");
      const { authentication } = response;
      if (!authentication) {
        throw new Error('No authentication object returned');
      }

      const token = authentication.accessToken;
      if (!token) {
        throw new Error('No token found in authentication response');
      }
      
      console.log("Token obtained");
      
      // Fetch user info with the token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const userInfoData = await userInfoResponse.json();
      console.log('User info fetched successfully');
      
      setUserInfo(userInfoData);
      setIsLoggedIn(true);
      
      // Store user data in AsyncStorage for persistence
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoData));
      console.log("User data stored successfully");
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert("Error", `Failed to get user data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      // Clear any existing stored data before signing in
      await AsyncStorage.removeItem('userInfo');
      
      console.log("Starting web sign-in process");
      const result = await promptAsync();
      console.log('Prompt async result type:', result.type);
    } catch (error) {
      console.error('Error during sign in:', error);
      Alert.alert("Sign In Error", error.message);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
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
    signOut,
    request,
    response,
  };
}

// Legacy export for backward compatibility
export function useGoogleAuth() {
  return useWebGoogleAuth();
}