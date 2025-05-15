// DevBypass.js - Development authentication bypass
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDevAuth() {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if dev bypass is enabled
    async function checkDevBypass() {
      const bypassEnabled = await AsyncStorage.getItem('devBypassEnabled');
      if (bypassEnabled === 'true') {
        enableDevBypass(false); // false means don't save to storage again
      }
    }
    
    checkDevBypass();
  }, []);
  
  // Enable development bypass
  const enableDevBypass = async (save = true) => {
    console.log("Enabling development authentication bypass");
    
    const mockUserInfo = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      name: 'Development User',
      photo: null,
    };
    
    setUserInfo(mockUserInfo);
    setIsLoggedIn(true);
    
    if (save) {
      await AsyncStorage.setItem('devBypassEnabled', 'true');
      await AsyncStorage.setItem('userInfo', JSON.stringify(mockUserInfo));
    }
  };
  
  // Disable development bypass
  const disableDevBypass = async () => {
    console.log("Disabling development authentication bypass");
    setUserInfo(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('devBypassEnabled');
    await AsyncStorage.removeItem('userInfo');
  };
  
  // Sign out function (just disables the bypass)
  const signOut = () => disableDevBypass();
  
  return {
    userInfo,
    isLoggedIn,
    isLoading: false,
    signIn: enableDevBypass,
    signOut,
    enableDevBypass,
    disableDevBypass
  };
}