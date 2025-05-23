// lib/supabase-minimal.js - Use this version if WebSocket errors persist
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// Manual HTTP client approach (no WebSocket dependencies)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

class MinimalSupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.authToken = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.url}/rest/v1${endpoint}`;
    const headers = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: data };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Request error:', error);
      return { data: null, error };
    }
  }

  async signUp(email, password) {
    try {
      const response = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: data };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signIn(email, password) {
    try {
      const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': this.key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { data: null, error: data };
      }

      this.authToken = data.access_token;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut() {
    this.authToken = null;
    return { error: null };
  }
}

export const supabase = new MinimalSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const authHelpers = {
  signUp: (email, password) => supabase.signUp(email, password),
  signIn: (email, password) => supabase.signIn(email, password),
  signOut: () => supabase.signOut(),
  getCurrentUser: async () => ({ user: null, error: null }), // Simplified
  getSession: async () => ({ session: null, error: null }), // Simplified
};