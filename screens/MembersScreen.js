import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Colors from '../constants/Colors';

export default function MembersScreen() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id) // Exclude current user
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading profiles:', error);
        Alert.alert('Error', 'Failed to load profiles. Please try again.');
        return;
      }

      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error) {
      console.error('Unexpected error loading profiles:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfiles();
  }, [user?.id]);

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const filtered = profiles.filter(profile => {
        const searchLower = searchQuery.toLowerCase();
        return (
          profile.name?.toLowerCase().includes(searchLower) ||
          profile.email?.toLowerCase().includes(searchLower) ||
          profile.dorm_name?.toLowerCase().includes(searchLower) ||
          profile.major?.toLowerCase().includes(searchLower) ||
          profile.year_in_school?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredProfiles(filtered);
    }
  }, [searchQuery, profiles]);

  // Generate avatar text
  const getAvatarText = (profile) => {
    const displayName = profile.display_name || profile.name;
    if (displayName) {
      return displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    return profile.email?.charAt(0).toUpperCase() || 'U';
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  // Profile detail modal/card
  const ProfileDetailModal = ({ profile, onClose }) => (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: Colors[theme].cardBackground }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>
            Profile Details
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          {/* Avatar */}
          <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.modalAvatarText}>{getAvatarText(profile)}</Text>
          </View>

          {/* Name and basic info */}
          <Text style={[styles.modalName, { color: Colors[theme].text }]}>
            {profile.name || 'No name set'}
          </Text>
          
          {profile.is_ra && (
            <View style={styles.raBadge}>
              <Text style={styles.raBadgeText}>RA</Text>
            </View>
          )}

          {profile.bio && (
            <Text style={[styles.modalBio, { color: Colors[theme].text }]}>
              {profile.bio}
            </Text>
          )}

          {/* Details */}
          <View style={styles.modalDetails}>
            {profile.dorm_name && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors[theme].text }]}>Dorm:</Text>
                <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                  {profile.dorm_name} {profile.room_number && `#${profile.room_number}`}
                </Text>
              </View>
            )}
            
            {profile.year_in_school && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors[theme].text }]}>Year:</Text>
                <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                  {profile.year_in_school}
                </Text>
              </View>
            )}
            
            {profile.major && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: Colors[theme].text }]}>Major:</Text>
                <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                  {profile.major}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: Colors[theme].text }]}>Member Since:</Text>
              <Text style={[styles.detailValue, { color: Colors[theme].text }]}>
                {formatDate(profile.created_at)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Individual profile card
  const ProfileCard = ({ profile }) => (
    <TouchableOpacity
      style={[styles.profileCard, { backgroundColor: Colors[theme].cardBackground }]}
      onPress={() => setSelectedProfile(profile)}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{getAvatarText(profile)}</Text>
        </View>
      </View>

      <View style={styles.cardMiddle}>
        <View style={styles.nameContainer}>
          <Text style={[styles.profileName, { color: Colors[theme].text }]}>
            {profile.name || 'No name set'}
          </Text>
          {profile.is_ra && (
            <View style={styles.raSmallBadge}>
              <Text style={styles.raSmallBadgeText}>RA</Text>
            </View>
          )}
        </View>
        
        {profile.dorm_name && (
          <Text style={[styles.profileDorm, { color: Colors[theme].text }]}>
            {profile.dorm_name} {profile.room_number && `#${profile.room_number}`}
          </Text>
        )}
        
        {profile.year_in_school && (
          <Text style={[styles.profileYear, { color: Colors[theme].text }]}>
            {profile.year_in_school}
          </Text>
        )}
        
        {profile.major && (
          <Text style={[styles.profileMajor, { color: Colors[theme].text }]}>
            {profile.major}
          </Text>
        )}
      </View>

      <View style={styles.cardRight}>
        <Text style={[styles.chevron, { color: Colors[theme].tabIconDefault }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: Colors[theme].text }]}>
            Loading profiles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[theme].cardBackground }]}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>
          Community Profiles
        </Text>
        <Text style={[styles.subtitle, { color: Colors[theme].tabIconDefault }]}>
          {filteredProfiles.length} {filteredProfiles.length === 1 ? 'member' : 'members'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: Colors[theme].cardBackground,
              color: Colors[theme].text,
              borderColor: Colors[theme].border || '#ddd'
            }
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, dorm, major, year..."
          placeholderTextColor={Colors[theme].tabIconDefault}
        />
      </View>

      {/* Profiles List */}
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfileCard profile={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: Colors[theme].tabIconDefault }]}>
              {searchQuery ? 'No profiles match your search' : 'No profiles found'}
            </Text>
          </View>
        )}
      />

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
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
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
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
  cardLeft: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  raSmallBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  raSmallBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileDorm: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 2,
  },
  profileYear: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  profileMajor: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  cardRight: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  chevron: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    margin: 20,
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  raBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  raBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBio: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    opacity: 0.8,
  },
  modalDetails: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
});