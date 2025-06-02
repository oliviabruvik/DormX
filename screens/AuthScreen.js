// screens/AuthScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, needsOnboarding, completeOnboarding, user } = useAuth();

    // Onboarding modal states
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [newUserId, setNewUserId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isRA, setIsRA] = useState(false);
  const [dormBuilding, setDormBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const autoJoinDefaultChannels = async (userId) => {
    if (!userId) return;

    try {
      console.log('Auto-joining user to default channels');

      const defaultChannelNames = ['General', 'Announcements', 'Events'];

      const { data : defaultChannels, error} = await supabase
        .from('channels')
        .select('id, name')
        .in('name', defaultChannelNames);

      if (error || !defaultChannels) {
        console.error('Error getting default channels:', error)
        return;
      }

      const { data: existingMemberships } = await supabase
        .from('chat_members')
        .select('channel_id')
        .eq('user_id', userId);

      const existingChannelIds = existingMemberships?.map(m => m.channel_id) || [];

      const channelsToJoin = defaultChannels.filter(
        channel => !existingChannelIds.includes(channel.id)
      );

      if (channelsToJoin.length === 0) {
        console.log('User is already in all default channels');
        return
      }


      const membershipsToAdd = channelsToJoin.map(channel => ({
        user_id: userId,
        channel_id: channel.id,
        joined_at: new Date().toISOString()
      }));

      const { error: joinError } = await supabase
        .from('chat_members')
        .insert(membershipsToAdd);

      if (joinError) {
        console.error('Error auto-joining channels:', joinError);
      } else {
        console.log('Succesffuly auto-joined defualt channels');
      }
    } catch (error) {
      console.error('Error in auto-join:', error)
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Cannot upload an image without granting photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  }

  const uploadProfileImage = async (imageUri, userId) => {
    if (!imageUri || !userId) {
      return null;
    }

    try {
      // Create a unique filename
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadProfileImage:', error);
      return null;
    }
  };

 const handleCompleteOnboarding = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    if (!dormBuilding.trim()) {
      Alert.alert('Error', 'Please enter your dorm building');
      return;
    }

    setOnboardingLoading(true);

    try {
      let profileImageUrl = null;

      if (profileImage) {
        profileImageUrl = await uploadProfileImage(profileImage, user.id);
      }

      const onboardingData = {
        displayName,
        bio,
        email,
        profileImageUrl,
        isRA,
        dormBuilding,
        roomNumber
      };

      const result = await completeOnboarding(onboardingData);

      if (result.error) {
        Alert.alert('Error', 'Failed to complete profile setup');
        return;
      }

      // Auto-join default channels
      await autoJoinDefaultChannels(user.id);

      // Reset onboarding states
      resetOnboardingStates();

      Alert.alert(
        'Welcome to DormX!', 
        'Your profile has been set up successfully!'
      );
      // Reset onboarding states
      resetOnboardingStates();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'An unexpected error occurred during profile creation');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const resetOnboardingStates = () => {
    setNewUserId(null);
    setProfileImage(null);
    setDisplayName('');
    setBio('');
    setIsRA(false);
    setDormBuilding('');
    setRoomNumber('');
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password, { name });
        if (result.error) {
          Alert.alert('Sign Up Error', result.error.message);
        } else if (result.data?.user?.id) {
            console.log('Signup successful! User ID:', result.data.user.id);
        } else {
          console.error('❌ Signup succeeded but no user data:', result);
          Alert.alert('Error', 'Account creation succeeded but user data is missing. Please try signing in.');
        }
      } else {
        result = await signIn(email, password);
        if (result.error) {
          Alert.alert('Sign In Error', result.error.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setName('');
  };

  // console.log('📊 Current state:', {
  //   showOnboardingModal,
  //   newUserId,
  //   displayName,
  //   isSignUp
  // });

  // Show onboarding modal if user needs onboarding
  if (needsOnboarding) {
    return (
      <SafeAreaView style={styles.onboardingContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.onboardingContent}
        >
          <View style={styles.onboardingHeader}>
            <Text style={styles.onboardingTitle}>Complete Your Profile</Text>
            <Text style={styles.onboardingSubtitle}>
              Let's set up your DormX profile to get started
            </Text>
          </View>

          <ScrollView style={styles.onboardingForm} showsVerticalScrollIndicator={false}>
            {/* Profile Image */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Profile Picture</Text>
              <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>📷</Text>
                    <Text style={styles.imagePickerText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Display Name */}
            <View style={styles.onboardingInputContainer}>
              <Text style={styles.onboardingInputLabel}>Display Name *</Text>
              <TextInput
                style={styles.onboardingInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How should others see your name?"
                autoCapitalize="words"
                maxLength={50}
              />
              <Text style={styles.characterCount}>{displayName.length}/50</Text>
            </View>

            {/* Bio */}
            <View style={styles.onboardingInputContainer}>
              <Text style={styles.onboardingInputLabel}>Bio</Text>
              <TextInput
                style={[styles.onboardingInput, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                multiline={true}
                numberOfLines={3}
                maxLength={150}
              />
              <Text style={styles.characterCount}>{bio.length}/150</Text>
            </View>

            {/* Dorm Information */}
            <View style={styles.dormSection}>
              <Text style={styles.sectionTitle}>Dorm Information</Text>
              
              <View style={styles.onboardingInputContainer}>
                <Text style={styles.onboardingInputLabel}>Building *</Text>
                <TextInput
                  style={styles.onboardingInput}
                  value={dormBuilding}
                  onChangeText={setDormBuilding}
                  placeholder="e.g., Smith Hall, West Campus"
                  autoCapitalize="words"
                  maxLength={30}
                />
              </View>

              <View style={styles.onboardingInputContainer}>
                <Text style={styles.onboardingInputLabel}>Room Number</Text>
                <TextInput
                  style={styles.onboardingInput}
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  placeholder="e.g., 205A"
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            </View>

            {/* RA Status */}
            <View style={styles.raSection}>
              <View style={styles.raToggleContainer}>
                <View style={styles.raInfo}>
                  <Text style={styles.raTitle}>Resident Assistant (RA)</Text>
                  <Text style={styles.raDescription}>
                    RAs have additional privileges for managing events and announcements
                  </Text>
                </View>
                <Switch
                  value={isRA}
                  onValueChange={setIsRA}
                  trackColor={{ false: '#767577', true: '#7B5AFF80' }}
                  thumbColor={isRA ? '#7B5AFF' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.onboardingActions}>
            <TouchableOpacity 
              style={[styles.completeButton, onboardingLoading && styles.completeButtonDisabled]}
              onPress={handleCompleteOnboarding}
              disabled={onboardingLoading}
            >
              <LinearGradient
                colors={onboardingLoading ? ["#CCCCCC", "#999999"] : ["#7B5AFF", "#3B1AFA"]}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>
                  {onboardingLoading ? 'Setting up...' : 'Complete Setup'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={["#7B5AFF", "#3B1AFA"]}
            style={styles.header}
          >
            <Text style={styles.title}>DormX</Text>
            <Text style={styles.subtitle}>Your Dorm Life Companion</Text>
          </LinearGradient>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Pressable
              style={[styles.authButton, loading && styles.authButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ["#CCCCCC", "#999999"] : ["#7B5AFF", "#3B1AFA"]}
                style={styles.authButtonGradient}
              >
                <Text style={styles.authButtonText}>
                  {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.toggleButton} onPress={toggleMode}>
              <Text style={styles.toggleText}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "rgba(240, 213, 220, 0.9)",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgb(228, 205, 113)",
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  authButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#7B5AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonDisabled: {
    shadowOpacity: 0.1,
  },
  authButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  toggleButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleText: {
    color: '#7B5AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  onboardingContent: {
    flex: 1,
  },
  onboardingHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  onboardingForm: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  imagePickerContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#7B5AFF',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 30,
    marginBottom: 8,
  },
  imagePickerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  onboardingInputContainer: {
    marginBottom: 20,
  },
  onboardingInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  onboardingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 4,
  },
  dormSection: {
    marginBottom: 32,
  },
  raSection: {
    marginBottom: 32,
  },
  raToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  raInfo: {
    flex: 1,
    marginRight: 16,
  },
  raTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  raDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  spacer: {
    height: 100,
  },
  onboardingActions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#7B5AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonDisabled: {
    shadowOpacity: 0.1,
  },
  completeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});