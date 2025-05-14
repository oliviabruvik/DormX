// WebAuth.js - Alternative solution for Android
import React, { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Register the redirect handler
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Configure platform-specific redirect URI
  let redirectUri;
  if (Platform.OS === 'web') {
    // For web, don't use proxy
    redirectUri = makeRedirectUri({
      useProxy: false
    });
  } else if (Platform.OS === 'android') {
    // For Android/iOS, use the auth proxy
    redirectUri = makeRedirectUri({
      useProxy: true
    });
  }
  
  console.log('Platform:', Platform.OS);
  console.log('Redirect URI:', redirectUri);
  
  // Configure Google Auth differently for web vs. native
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      expoClientId: '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com',
      androidClientId: '12343180424-ju2p322l4rpf5a546ihscc3obomhts5h.apps.googleusercontent.com',
      webClientId: '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com',
      redirectUri,
      scopes: ['profile', 'email'],
    },
    { 
      // Platform-specific proxy settings
      useProxy: Platform.OS !== 'web',
      // Select account only on web
      selectAccount: Platform.OS === 'web',
    }
  );

  useEffect(() => {
    // Check for stored user data
    checkLocalUserInfo();
  }, []);

  useEffect(() => {
    console.log('OAuth response:', response ? JSON.stringify(response, null, 2) : null);
    if (response?.type === 'success') {
      handleSignInResponse(response);
    } else if (response?.type === 'error') {
      console.error('Auth Error Details:', response.error);
      
      // Show different alerts based on platform
      if (Platform.OS === 'web') {
        console.error('Authentication error:', response.error);
      } else {
        Alert.alert(
          "Authentication Error", 
          `Error: ${response.error?.description || response.error?.message || "Unknown error"}`,
          [{ text: "OK" }]
        );
      }
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
        console.log("User loaded from AsyncStorage:", parsedUserData);
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

      const { accessToken } = authentication;
      console.log("Access token obtained:", accessToken ? "Yes" : "No");
      
      // Fetch user info with the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const userInfoData = await userInfoResponse.json();
      console.log('User info fetched:', userInfoData);
      
      // Important: Set both states in the same cycle
      setUserInfo(userInfoData);
      setIsLoggedIn(true);
      
      // Store user data in AsyncStorage for persistence
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoData));
      console.log("User data stored successfully");
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (Platform.OS !== 'web') {
        Alert.alert("Error", `Failed to get user data: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      // Clear any existing stored data before signing in
      await AsyncStorage.removeItem('userInfo');
      
      console.log("Starting sign-in process");
      const result = await promptAsync();
      console.log('Prompt async result:', JSON.stringify(result, null, 2));
      // The rest handled in the useEffect that watches response
    } catch (error) {
      console.error('Error during sign in:', error);
      if (Platform.OS !== 'web') {
        Alert.alert("Sign In Error", error.message);
      }
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