// screens/DebugScreen.js - Use this to test your Supabase connection
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authHelpers } from '../lib/supabase-simulator-fix';

export default function DebugScreen() {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testConnection = async () => {
    setTesting(true);
    addLog('🔍 Testing Supabase connection...', 'info');
    
    try {
      const result = await authHelpers.testConnection();
      
      if (result.connected) {
        addLog('✅ Connection successful!', 'success');
      } else {
        addLog('❌ Connection failed: ' + (result.error?.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      addLog('❌ Connection test error: ' + error.message, 'error');
    }
    
    setTesting(false);
  };

  const testSignUp = async () => {
    addLog('📝 Testing sign up...', 'info');
    
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'testpass123';
      
      const result = await authHelpers.signUp(testEmail, testPassword);
      
      if (result.error) {
        addLog('❌ Sign up failed: ' + result.error.message, 'error');
      } else {
        addLog('✅ Sign up successful!', 'success');
      }
    } catch (error) {
      addLog('❌ Sign up test error: ' + error.message, 'error');
    }
  };

  const testSignIn = async () => {
    addLog('🔐 Testing sign in...', 'info');
    
    try {
      // Try with a test account - you'll need to create this manually first
      const result = await authHelpers.signIn('test@example.com', 'testpass123');
      
      if (result.error) {
        addLog('❌ Sign in failed: ' + result.error.message, 'error');
      } else {
        addLog('✅ Sign in successful!', 'success');
      }
    } catch (error) {
      addLog('❌ Sign in test error: ' + error.message, 'error');
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#22C55E';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Debug Console</Text>
        <Text style={styles.subtitle}>Test your connection and auth</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, testing && styles.buttonDisabled]}
          onPress={testConnection}
          disabled={testing}
        >
          <Text style={styles.buttonText}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSignUp}>
          <Text style={styles.buttonText}>Test Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSignIn}>
          <Text style={styles.buttonText}>Test Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Debug Logs:</Text>
        <ScrollView style={styles.logScroll}>
          {logs.map((log, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={[styles.logText, { color: getLogColor(log.type) }]}>
                [{log.timestamp}] {log.message}
              </Text>
            </View>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogs}>No logs yet. Run a test!</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#7B5AFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#7B5AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  logScroll: {
    flex: 1,
  },
  logEntry: {
    marginBottom: 8,
  },
  logText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  noLogs: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 20,
  },
});