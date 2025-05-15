// ProfileScreen.js - Updated for Supabase
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useAuth } from './AuthContext'; // Import the AuthContext
import Colors from '../constants/Colors';

export default function ProfileScreen() {
  // Access the auth context to get user info and signOut function
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile information...</Text>
      </View>
    );
  }

  // Extract user information from Supabase user object
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || 'No email provided';
  const userAvatar = user.user_metadata?.avatar_url || 'https://via.placeholder.com/150';

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: userAvatar }}
          style={styles.profilePic}
        />
        <Text style={[styles.profileName, { color: Colors[theme].text }]}>{userName}</Text>
        <Text style={[styles.profileEmail, { color: Colors[theme].text }]}>{userEmail}</Text>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>Account Information</Text>
        <View style={[styles.infoCard, { backgroundColor: Colors[theme].cardBackground }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>User ID</Text>
            <Text style={[styles.infoValue, { color: Colors[theme].text }]}>{user.id.slice(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>Email</Text>
            <Text style={[styles.infoValue, { color: Colors[theme].text }]}>{userEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>Account Type</Text>
            <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
              {user.app_metadata?.provider || 'Email'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#e1e1e1',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});