// ProfileScreen.js - Fixed version
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook instead
import Colors from '../constants/Colors';

export default function ProfileScreen() {
  // Use the useAuth hook to get user info and signOut function
  const { userInfo, signOut, loading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  // Handle sign out with confirmation
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const result = await signOut();
            if (result.error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
            Loading profile information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userInfo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: Colors[theme].text }]}>
            Unable to load profile information
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ScrollView>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: Colors[theme].cardBackground }]}>
          <Image
            source={{
              uri: userInfo.avatar_url || 'https://via.placeholder.com/120x120/7B5AFF/FFFFFF?text=' + (userInfo.name?.charAt(0) || 'U')
            }}
            style={styles.profilePic}
          />
          <Text style={[styles.profileName, { color: Colors[theme].text }]}>
            {userInfo.name || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: Colors[theme].text }]}>
            {userInfo.email}
          </Text>
        </View>
        
        {/* Account Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Account Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: Colors[theme].cardBackground }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
                Name
              </Text>
              <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
                {userInfo.name || 'Not set'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
                {userInfo.email}
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
                Account Type
              </Text>
              <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
                Supabase Account
              </Text>
            </View>
          </View>
        </View>
        
        {/* Actions Section */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#7B5AFF',
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
    flex: 1,
    textAlign: 'right',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});