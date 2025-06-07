// ProfileScreen.js - Fixed version
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Colors from '../constants/Colors';

export default function ProfileScreen() {
  // Use the useAuth hook to get user info and signOut function
  const { user, userProfile, signOut, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDormName, setEditDormName] = useState('');
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editYearInSchool, setEditYearInSchool] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [newProfileImage, setNewProfileImage] = useState(null);

  const loadProfileData = async () => {
    if (!user.id) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error('Unexpected error loading profile:', error)
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);


  const startEditing = () => {
    const profile = profileData || userProfile;
    setEditName(profile?.name || '');
    setEditBio(profile?.bio || '');
    setEditDormName(profile?.dorm_name || '');
    setEditRoomNumber(profile?.room_number || '');
    setEditYearInSchool(profile?.year_in_school || '');
    setEditMajor(profile?.major || '');
    setNewProfileImage(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewProfileImage(null);
  };

  const saveChanges = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      const updateData = {
        name: editName.trim(),
        bio: editBio.trim(),
        dorm_name: editDormName.trim(),
        room_number: editRoomNumber.trim(),
        year_in_school: editYearInSchool.trim(),
        major: editMajor.trim(),
        // avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      // Refresh local data
      await loadProfileData();
      setIsEditing(false);
      setNewProfileImage(null);

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  
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

  // Use profileData if available, fallback to userProfile
  const displayProfile = profileData || userProfile;

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

  if (!user || !displayProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: Colors[theme].text }]}>
            Unable to load profile information
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadProfileData}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Helper function to render avatar
  const renderAvatar = () => {
    const initials = displayProfile.name ? 
      displayProfile.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase() : 
      user.email?.charAt(0).toUpperCase() || 'U';
    
    return (
      <View style={[styles.profilePic, styles.avatarPlaceholder]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };


  const renderEditableField = (label, value, editValue, onChangeText, placeholder, multiline = false, maxLength = 50) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
        {label}
      </Text>
      {isEditing ? (
        <View style={styles.editFieldContainer}>
          <TextInput
            style={[
              styles.editInput,
              multiline && styles.editInputMultiline,
              { 
                backgroundColor: Colors[theme].cardBackground,
                color: Colors[theme].text,
                borderColor: Colors[theme].border || '#ddd'
              }
            ]}
            value={editValue}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors[theme].tabIconDefault}
            multiline={multiline}
            maxLength={maxLength}
            autoCapitalize={multiline ? 'sentences' : 'words'}
          />
          {maxLength && (
            <Text style={[styles.charCount, { color: Colors[theme].tabIconDefault }]}>
              {editValue.length}/{maxLength}
            </Text>
          )}
        </View>
      ) : (
        <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
          {value || 'Not set'}
        </Text>
      )}
    </View>
  );
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: Colors[theme].cardBackground }]}>
          {renderAvatar()}

          {isEditing ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={[styles.nameEditInput, { 
                    color: Colors[theme].text,
                    borderColor: Colors[theme].border || '#ddd'
                  }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors[theme].tabIconDefault}
                  textAlign="center"
                  maxLength={50}
                />
              </View>
            ) : (
              <Text style={[styles.profileName, { color: Colors[theme].text }]}>
                {displayProfile.name || 'No name set'}
              </Text>
            )}
          
          {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelEditing}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton]}
                  onPress={saveChanges}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={startEditing}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
        </View>

        {/* General Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            General Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: Colors[theme].cardBackground }]}>
            {renderEditableField(
                'Full Name', 
                displayProfile.name, 
                editName, 
                setEditName, 
                'Enter your full name'
              )}
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Personal Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: Colors[theme].cardBackground }]}>
            {renderEditableField(
                'Dorm Name', 
                displayProfile.dorm_name, 
                editDormName, 
                setEditDormName, 
                'e.g., Smith Hall'
              )}
            
            <View style={styles.infoRow}>
              {renderEditableField(
                'Room Number', 
                displayProfile.room_number, 
                editRoomNumber, 
                setEditRoomNumber, 
                'e.g., 205A',
                false,
                10
              )}
            </View>

            <View style={styles.roleContainer}>
              <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
                User Type
              </Text>
              <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
                {displayProfile.is_ra ? 'Resident Assistant (RA)' : 'Resident'}
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Academic Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: Colors[theme].cardBackground }]}>
            {renderEditableField(
                'Year in School', 
                displayProfile.year_in_school, 
                editYearInSchool, 
                setEditYearInSchool, 
                'e.g., Freshman, Sophomore'
              )}

            {renderEditableField(
                'Major', 
                displayProfile.major, 
                editMajor, 
                setEditMajor
              )}
          </View>
        </View>
        
        {/* Account Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
            Account Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: Colors[theme].cardBackground }]}>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: Colors[theme].text }]}>
                Member Since
              </Text>
              <Text style={[styles.infoValue, { color: Colors[theme].text }]}>
                {formatDate(displayProfile.created_at || user.created_at)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Actions Section */}
        {!isEditing && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
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
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    flex: 2,
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editFieldContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    width: '100%',
    textAlign: 'right',
  },
  editInputMultiline: {
    height: 60,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
    gap: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 2,
  },
});