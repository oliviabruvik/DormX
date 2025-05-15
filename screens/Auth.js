// Auth.js - Fixed with import checking
import { Platform } from 'react-native';
import * as WebAuthModule from './WebAuth';
import * as NativeAuthModule from './NativeGoogleAuth';

// Check if the modules have the expected exports
const hasWebAuth = typeof WebAuthModule.useWebGoogleAuth === 'function';
const hasNativeAuth = typeof NativeAuthModule.useNativeGoogleAuth === 'function';

console.log('Auth.js - Platform:', Platform.OS);
console.log('Auth.js - WebAuth available:', hasWebAuth);
console.log('Auth.js - NativeAuth available:', hasNativeAuth);

// Export the appropriate authentication hook based on platform
export function useGoogleAuth() {
  // For Android, try to use native auth if available, fall back to web auth
  if (Platform.OS === 'android') {
    if (hasNativeAuth) {
      console.log('Using native Google auth');
      return NativeAuthModule.useNativeGoogleAuth();
    } else {
      console.log('Native auth not available, falling back to web auth');
      // Fallback to web auth if native is not available
      return WebAuthModule.useWebGoogleAuth ? 
        WebAuthModule.useWebGoogleAuth() : 
        WebAuthModule.useGoogleAuth();
    }
  } 
  // For web
  else {
    console.log('Using web Google auth');
    // Try to use web-specific auth hook if available, otherwise use legacy hook
    return WebAuthModule.useWebGoogleAuth ? 
      WebAuthModule.useWebGoogleAuth() : 
      WebAuthModule.useGoogleAuth();
  }
}