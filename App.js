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

// Display logs in-app
LogBox.ignoreAllLogs(false);
LogBox.ignoreLogs(['specific warning to ignore']);  // Optional

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});