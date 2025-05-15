// App.js - Modified to bypass authentication
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  LogBox,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // Import your existing navigator
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Import SafeAreaProvider
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, Platform } from "react-native";
import { PaperProvider } from 'react-native-paper';

// In your components, add more console.log statements
console.log('App starting - Authentication bypassed');

// AuthContext for sharing auth info with deeper components if needed later
import { createContext } from 'react';
export const AuthContext = createContext(null);

// Main App component
export default function App() {
  // Mock auth data to simulate a logged-in user
  const mockAuth = {
    isLoggedIn: true,  // Always true to bypass login
    isLoading: false,
    userInfo: {
      name: 'Test User',
      email: 'test@example.com',
      // Add any other user properties your app expects
    },
    signIn: () => console.log('Sign in bypassed'),
    signOut: () => console.log('Sign out bypassed'),
  };

  console.log("App rendering with bypassed authentication");

  // Directly show the main app with navigation
  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={mockAuth}>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <PaperProvider>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar 
            style="light"
            backgroundColor={Colors.primary}
          />
        </SafeAreaProvider>
      </PaperProvider>
    );
  }
}