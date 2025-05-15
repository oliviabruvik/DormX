import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Important: Register the redirect handler
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  
  // Get the redirect URI with proper proxy setup
  const redirectUri = makeRedirectUri({
    useProxy: true,
  });
  
  // Log the redirect URI for debugging
  console.log('Redirect URI:', redirectUri);
  
  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      expoClientId: '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com',
      webClientId: '12343180424-rd5r15ump73l9k64k64i492v9f861jh9.apps.googleusercontent.com',
      iosClientId: '12343180424-cilnvcff23bj0pp2rtchlj8i1mtjlade.apps.googleusercontent.com',
      androidClientId: '12343180424-ju2p322l4rpf5a546ihscc3obomhts5h.apps.googleusercontent.com',
      redirectUri,
      scopes: ['profile', 'email']
    },
    { useProxy: true }
  );

  console.log('Full response object:', JSON.stringify(response, null, 2));

  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(false);
      const { authentication } = response;
      console.log('Successfully authenticated!');
      console.log('Access Token:', authentication.accessToken);
      // Handle the successful authentication
      // You can navigate to another screen or fetch user info here
    } else if (response?.type === 'error') {
      setLoading(false);
      console.log('Error response:', response);
      Alert.alert('Authentication Error', response.error?.message || 'Something went wrong');
    }
  }, [response]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      setLoading(false);
      console.error('Error initiating auth flow:', error);
      Alert.alert('Error', 'Failed to start the authentication process');
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={loading ? "Loading..." : "Sign in with Google"}
        disabled={!request || loading}
        onPress={handleSignIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});