// App.js - Updated with Supabase authentication
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './screens/AuthScreen'; // We'll create this

// Display logs in-app
LogBox.ignoreAllLogs(false);
LogBox.ignoreLogs(['specific warning to ignore']);

console.log('App starting with Supabase authentication');

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#7B5AFF" />
    <Text style={styles.loadingText}>Loading DormX...</Text>
  </View>
);

// Main navigation component that checks auth state
const AppNavigator = () => {
  const { user, loading, initialized, isLoggedIn } = useAuth();

  console.log('Auth state:', { user: !!user, loading, initialized, isLoggedIn });

  // Show loading screen while initializing
  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  // Show auth screen if not logged in
  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  // Show main app if logged in
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
};

// Root App component
export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#7B5AFF',
  },
});