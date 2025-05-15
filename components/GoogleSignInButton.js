// components/GoogleSignInButton.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../supabaseClient'; // Update path as needed
import { useAuth } from '../screens/AuthContext';

const GoogleSignIn = () => {
  const { handleGoogleSignInResult } = useAuth();

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      // The Web Client ID from Google Cloud Console
      webClientId: '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com', 
      offlineAccess: false,
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful', userInfo);
      
      // Get the ID token
      if (userInfo.idToken) {
        // Sign in to Supabase with the Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });
        
        if (error) {
          throw error;
        }
        
        console.log('Supabase Google auth successful:', data);
        
        // Update the auth context
        handleGoogleSignInResult(data);
      } else {
        throw new Error('No ID token present!');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.log('Other error:', error.message);
      }
    }
  };

  // Only render on Android
  if (Platform.OS !== 'android') {
    return null;
  }

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 15,
  },
  button: {
    width: 240,
    height: 48,
  },
});

export default GoogleSignIn;