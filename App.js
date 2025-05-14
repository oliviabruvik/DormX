// App.js - Integrated with your existing BottomTabNavigator
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  LogBox,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useGoogleAuth } from './screens/Auth'; // Make sure this path is correct
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // Import your existing navigator
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Import SafeAreaProvider

// Display logs in-app
LogBox.ignoreAllLogs(false);
LogBox.ignoreLogs(['specific warning to ignore']);  // Optional

// In your components, add more console.log statements
console.log('This will show in LogBox');

// Make sure to call this at the top level of your file
WebBrowser.maybeCompleteAuthSession();

// Stack navigator for when user is logged in
const Stack = createStackNavigator();

// Login screen component
const LoginScreen = ({ onLogin, loading }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appTitle}>DormX</Text>
        <Text style={styles.appSubtitle}>Your Dorm Life Companion</Text>
      </View>
      
      <TouchableOpacity
        style={styles.googleButton}
        onPress={onLogin}
        disabled={loading}
      >
        <View style={styles.googleButtonContent}>
          <View style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// AuthContext for sharing auth info with deeper components
import { createContext } from 'react';
export const AuthContext = createContext(null);

// Main App component
export default function App() {
  // Use our custom hook for auth
  const auth = useGoogleAuth();
  const { isLoggedIn, isLoading, userInfo } = auth;

  console.log("App rendering. isLoggedIn:", isLoggedIn);
  console.log("User info:", userInfo);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.centerContent]}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // If logged in, show the main app with navigation
  if (isLoggedIn && userInfo) {
    return (
      <SafeAreaProvider>
        <AuthContext.Provider value={auth}>
          <NavigationContainer>
            <BottomTabNavigator />
          </NavigationContainer>
        </AuthContext.Provider>
      </SafeAreaProvider>
    );
  }

  // If not logged in, show login screen
  return (
    <SafeAreaProvider>
      <View style={styles.safeArea}>
        <LoginScreen onLogin={auth.signIn} loading={isLoading} />
      </View>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#5f6368',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'center',
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      }
    }),
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
});