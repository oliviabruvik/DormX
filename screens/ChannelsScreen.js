import React, { use, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  useColorScheme, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { Avatar, Button, Card, Title, Paragraph, Searchbar, Text as PaperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ChannelsScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const { user } = useAuth();

  const [channels, setChannels] = useState([]);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showChannelDetailsModal, setShowChannelDetailsModal] = useState(false);

  const [availableChannels, setAvailableChannels] = useState([]);
  const [selectedChannelDetails, setSelectedChannelDetails] = useState(null);

  //Form
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateChannel = () => {
    console.log('Create new channel pressed');
    setShowOptionsModal(true);
  }

  const resetForm = () => {
    setChannelName('');
    setChannelDescription('');
    setIsPrivate(false);
    setSearchQuery('');
    setAvailableChannels([]);
  }

  const handleCloseAllModals = () => {
    setShowOptionsModal(false);
    setShowCreateModal(false);
    setShowJoinModal(false);
    setShowChannelDetailsModal(false);
    setSelectedChannelDetails(null);
    resetForm();
  }

  const handleOptionSelect = (option) => {
    setShowOptionsModal(false);

    if (option === 'create') {
      setShowCreateModal(true);
    } else if (option === 'join') {
      setShowJoinModal(true);
      loadAvailableChannels();
    }
  }

  const loadAvailableChannels = async () => {
    try {
      const { data: userChannels } = await supabase
        .from('chat_members')
        .select('channel_id')
        .eq('user_id', user.id);

      const userChannelIds = userChannels?.map(m => m.channel_id) || [];

      console.log("User in Channels", userChannelIds);

      let availableChannelsQuery = supabase
        .from('channels')
        .select('id, name, description, created_at, created_by')
        .eq('is_private', false)
        .order('name', { ascending: true });

      if (userChannelIds.length > 0) {
        availableChannelsQuery = availableChannelsQuery.not('id', 'in', `(${userChannelIds.join(',')})`);
      }

      const { data: availableChannels, error } = await availableChannelsQuery

      if (error) {
        console.error('Error loading available channels:', error);
        Alert.alert('Error', 'Failed to load available channels');
        return;
      }

      setAvailableChannels(availableChannels || []);

      console.log("Available Channels", availableChannels);

    } catch (error) {
      console.error('Unexpected error loading available channels:', error);
      Alert.alert('Error', 'Failed to load available channels');
    }

  }

  const loadChannelDetails = async (channel) => {
    try {
      const { data: members, error: membersError } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('channel_id', channel.id);

      if (membersError) {
        console.error('Error loading channel members:', membersError);
        Alert.alert('Error', 'Failed to load channel details');
        return;
      }

      const channelDetails = {
        ...channel,
        memberCount: members?.length || 0
      };

      setSelectedChannelDetails(channelDetails);
      setShowChannelDetailsModal(true);
    } catch (error) {
      console.error('Unexpected error loading channel details:', error);
      Alert.alert('Error', 'Failed to load channel details');
    }
  }

  const handleChannelNamePress = (channel) => {
    loadChannelDetails(channel);
  }

  const handleJoinFromDetails = () => {
    if (selectedChannelDetails) {
      setShowChannelDetailsModal(false);
      handleJoinChannel(selectedChannelDetails.id, selectedChannelDetails.name);
    }
  }

  const handleJoinChannel = async (channelId, channelName) => {
    try {
      const { data: existingMember } = await supabase
        .from('chat_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .single();

      if (existingMember) {
        Alert.alert('Already Joined', 'You are already a member of this channel.')
        return;
      }

      const { error: joinError } = await supabase
        .from('chat_members')
        .insert([
          {
            user_id: user.id,
            channel_id: channelId,
            joined_at: new Date().toISOString()
          }
        ]);

      if (joinError) {
        console.error('Error joining channel:', joinError);
        Alert.alert('Error', 'Failed to join channel');
        return;
      }

      Alert.alert('Success', `Successfully joined "${channelName}"!`);
      handleCloseAllModals();
      loadChannels();
    } catch (error) {
      console.error('Unexpected error joining channel:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  }

  const handleSubmitChannel = async () => {
    if (!channelName.trim()) {
      Alert.alert('Error', 'Please enter a channel name');
      return;
    }

    if (channelName.length < 3) {
      Alert.alert('Error', 'Channel name must be at least 3 characters');
      return;
    }

    if (channelName.length > 50) {
      Alert.alert('Error', 'Channel name must be less than 50 characters');
      return;
    }

    if (channelDescription.length > 200) {
      Alert.alert('Error', 'Channel description must be less than 200 characters');
      return;
    }

    try {
      const { data: newChannel, error: channelError } = await supabase
        .from('channels')
        .insert([
          {
            name: channelName.trim(),
            description: channelDescription.trim() || null,
            is_private: isPrivate,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (channelError) {
        console.error('Error creating channel:', channelError);
        Alert.alert('Error', 'Failed to create channel.')
        return;
      }

      const { error: memberError } = await supabase
        .from('chat_members')
        .insert([
          {
            user_id: user.id,
            channel_id: newChannel.id,
            joined_at: new Date().toISOString()
          }
        ]);

      if (memberError) {
        console.error('Error joining creator to channel:', memberError);
      }

      Alert.alert('Success', `Channel "${channelName}" created successfully!`);
      handleCloseAllModals();
      loadChannels();


    } catch (error) {
      console.error('Unexpected error creating channel:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }

  }

  // Set up navigation header with plus button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={[styles.plusButton, { backgroundColor: Colors.primary }]}
          onPress={handleCreateChannel}
        >
          <Text style={styles.plusButtonText}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadChannels = async () => {
    try {
      console.log('Loading channels');
      
      const { data, error } = await supabase
        .from('channels')
          .select(`
          id,
          name,
          is_private,
          created_by,
          created_at,
          chat_members!inner(user_id)
        `)
        .eq('chat_members.user_id', user.id)
        .order('name', {ascending: true});

      if (error) {
        console.error('Error loading channels:', error);
        Alert.alert('Error', 'Failed to load channels');
        return;
      }

      console.log('Loaded channels:', data);
      setChannels(data || []);
    } catch (error) {
      console.error('Unexpected error loading channels:', error)
      Alert.alert('Error', 'Failed to load chats');
    }
  }

  // Chat press handler
  const handleChatPress = (channelName) => {
    console.log('Pressed', channelName);
    navigation.navigate('ChatsScreen', { channelName});
    }; 


  useEffect(() => {
    loadChannels();
  }, []);


  const filteredAvailableChannels = availableChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderFeatures = () => {
    return channels.map((channel) => (
        <TouchableOpacity 
          key={channel.id} 
          style={[styles.chatItem, { backgroundColor: Colors.primary}]}
          onPress={() => handleChatPress(channel.name)}
        >
          <View style={[styles.chatContent, { backgroundColor: 'transparent' }]}>
            <View style={[styles.chatHeader, { backgroundColor: 'transparent' }]}>
              <Text 
                style={[styles.chatName, { color: Colors[theme].text}]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {channel.name}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ));
    };

  const renderAvailableChannels = () => {
    console.log("Available Channels after filter", filteredAvailableChannels);
    if (filteredAvailableChannels === 0) {
      return (
        <Text style={[styles.emptyText, { color: Colors[theme].text }]}>
          {searchQuery ? 'No channels found matching your search' : 'No public channels available to join'}
        </Text>
      )
    }

    return filteredAvailableChannels.map((channel) => (
      <TouchableOpacity
        key={channel.id}
        style={[styles.availableChannelItem, {
          backgroundColor: Colors[theme].background,
          borderColor: Colors[theme].text + '30',
          // color: Colors[theme].text
        }]}
        onPress={() => handleChannelNamePress(channel)}
        >
        <View style={styles.channelInfo}>
          <Text style={[styles.availableChannelName, { color: Colors[theme].text }]}>
            {channel.name}
          </Text>
        </View>
        <View style={[styles.joinButton, { backgroundColor: Colors.primary}]}>
          <Text style={styles.joinButtontext}>Join</Text>
        </View>
      </TouchableOpacity>
    ))
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.featuresContainer}>{renderFeatures()}</View>
      </ScrollView>
    
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.optionsOverlay}>
          <View style={[styles.optionsContainer, { backgroundColor: Colors[theme].background }]}>
            <Text style={[styles.optionsTitle, { color: Colors[theme].text }]}>
              Channel Options
            </Text>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: Colors.primary }]}
              onPress={() => handleOptionSelect('join')}
              >
                <Text style={[styles.modalTitle, {color: Colors[theme].text}]}>Join Existing Channel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, {backgroundColor: Colors.primary }]}
              onPress={() => handleOptionSelect('create')}
              >
                <Text style={[styles.modalTitle, {color: Colors[theme].text}]}>Create Channel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelOptionButton, { backgroundColor: Colors.primary }]}
              onPress={() => setShowOptionsModal(false)}
              >
                <Text style={[styles.cancelOptionButtonText, {color: Colors[theme].text}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Channel Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle='pageSheet'
        onRequestClose={() => setShowCreateModal(false)}
        >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[theme].background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={[styles.modalHeader, {borderBottomColor: Colors[theme].text + '20' }]}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={[styles.cancelButton, { color: Colors[theme].text }]}>Cancel</Text>
              </TouchableOpacity>

              <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>Create Channel</Text>
              <TouchableOpacity
                onPress={handleSubmitChannel}
                disabled={!channelName.trim()}
              >
                <Text style={[
                  styles.createButton,
                  { 
                    color: !channelName.trim() ? '#999' : Colors.primary,
                    opacity: !channelName.trim() ? 0.6 : 1
                  }
                ]}>
                Create
                </Text>
              </TouchableOpacity>
            </View>

                        <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: Colors[theme].text }]}>
                  Channel Name *
                </Text>
                <TextInput
                  style={[styles.formInput, {
                    backgroundColor: Colors[theme].background,
                    borderColor: Colors[theme].text + '30',
                    color: Colors[theme].text
                  }]}
                  value={channelName}
                  onChangeText={setChannelName}
                  placeholder="Enter channel name"
                  placeholderTextColor={Colors[theme].text + '60'}
                  maxLength={50}
                  autoFocus
                >

                </TextInput>
              </View>

              <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: Colors[theme].text}]}>
                    Description
                  </Text>
                  <TextInput 
                    style={[styles.formInput, styles.descriptionInput, {
                      backgroundColor: Colors[theme].background,
                      borderColor: Colors[theme].text + '30',
                      color: Colors[theme].text
                    }]}
                    value={channelDescription}
                    onChangeText={setChannelDescription}
                    placeholder="Enter channel description (optional)"
                    placeholderTextColor={Colors[theme].text + '60'}
                    maxLength={200}
                    multiline={true}
                    numberOfLines={3}
                  />
                  <Text style={[styles.characterCount, { color: Colors[theme].text + '80'}]}>
                    {channelDescription.length}/200
                  </Text>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.privacyRow}>
                  <View style={styles.privacyInfo}>
                    <Text style={[styles.formLabel, { color: Colors[theme].text, marginBottom: 0 }]}>
                      {isPrivate 
                        ? 'Private Channel'
                        : 'Public Channel'
                      }
                    </Text>
                    <Text style={[styles.privacyDescription, { color: Colors[theme].text + '80' }]}>
                      {isPrivate 
                        ? 'Only invited members can see and join this channel'
                        : 'Anyone in your dorm can discover and join this channel'
                      }
                    </Text>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={setIsPrivate}
                    trackColor={{ false: '#767577', true: Colors.primary + '80' }}
                    thumbColor={isPrivate ? Colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            </ScrollView>

          </KeyboardAvoidingView>
        </SafeAreaView>  
      </Modal>

      {/* Join Channel Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle='pageSheet'
        onRequestClose={() => setShowJoinModal(false)}
        >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[theme].background }]}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={[styles.modalHeader, {borderBottomColor: Colors[theme].text + '20' }]}>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Text style={[styles.cancelButton, { color: Colors[theme].text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: Colors[theme].text }]}>
                  Search Public Channels
                </Text>
                <TextInput
                  style={[styles.formInput, {
                    backgroundColor: Colors[theme].background,
                    borderColor: Colors[theme].text + '30',
                    color: Colors[theme].text
                  }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for channels..."
                  placeholderTextColor={Colors[theme].text + '60'}
                  autoFocus
                >
                </TextInput>
              </View>

              <View style={styles.availableChannelsContainer}>
                <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                  Available Channels
                </Text>
                {renderAvailableChannels()}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>  
      </Modal>

      {/* Channel Details Modal */}
      <Modal
        visible={showChannelDetailsModal}
        animationType="slide"
        presentationStyle='pageSheet'
        onRequestClose={() => setShowChannelDetailsModal(false)}
        >
        <View style={styles.detailsOverlay}>
          <View style={[styles.detailsContainer, { backgroundColor: Colors[theme].background }]}>
            {selectedChannelDetails && (
              <>
                <View style={styles.detailsHeader}>
                  <Text style={[styles.detailsTitle, { color: Colors[theme].text}]}>
                    {selectedChannelDetails.name}
                  </Text>
                  <TouchableOpacity
                    onPress ={() => setShowChannelDetailsModal(false)}
                    style={styles.closeButton}
                  >
                    <Text style={[styles.closeButtonText, { color: Colors[theme].text}]}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.detailsContent}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: Colors[theme].text }]}>Description</Text>
                    <Text style={[styles.detailValue, { color: Colors[theme].text + '80'}]}>{selectedChannelDetails.description || 'No description provided'}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: Colors[theme].text }]}>
                      Members
                    </Text>
                    <Text style={[styles.detailValue, { color: Colors[theme].text + '80' }]}>
                      {selectedChannelDetails.memberCount} {selectedChannelDetails.memberCount === 1 ? 'member' : 'members'}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.detailsActions}>
                  <TouchableOpacity
                    style={[styles.detailsJoinButton, { backgroundColor: Colors.primary }]}
                    onPress={handleJoinFromDetails}
                  >
                    <Text style={styles.detailsJoinButtonText}>
                      Join Channel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  featuresContainer: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flexShrink: 1,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  plusButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: "bold",
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionsContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionButton: {
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelOptionButton: {
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelOptionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalForm: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 25,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  privacyInfo: {
    flex: 1,
    marginRight: 15,
  },
  privacyDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  availableChannelsContainer: {
    // marginTop: 10,
  },
  availableChannelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  channelInfo: {
    flex: 1,
    marginRight: 15,
  },
  availableChannelName: {
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailsContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  closeButton:  {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContent: {
    padding: 20,
    maxHeight: 300,
  },
  detailItem: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  }, 
  detailValue: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailsActions: {
    padding: 20, 
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  detailsJoinButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  }, 
  detailsJoinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});