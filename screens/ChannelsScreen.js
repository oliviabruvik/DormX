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
  const [showNormsModal, setShowNormsModal] = useState(false);

  const [availableChannels, setAvailableChannels] = useState([]);
  const [selectedChannelDetails, setSelectedChannelDetails] = useState(null);

  //Form
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [agreedToNorms, setAgreedToNorms] = useState(false);

  // Community norms content
  const communityNorms = [
    "🤝 Respect all community members and their perspectives",
    "💬 Keep conversations relevant to the channel topic",
    "🚫 No harassment, bullying, or discriminatory language",
    "🔒 Respect privacy - don't share personal information without permission",
    "📱 Use appropriate language suitable for a dorm community",
    "🎯 Stay on topic and avoid excessive off-topic discussions",
    "🤐 What happens in private channels stays private",
    "🆘 Report any concerning behavior to RAs or moderators"
  ];

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
    setAgreedToNorms(false);
  }

  const handleCloseAllModals = () => {
    setShowOptionsModal(false);
    setShowCreateModal(false);
    setShowJoinModal(false);
    setShowChannelDetailsModal(false);
    setShowNormsModal(false);
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

      Alert.alert('Success', `Successfully joined "${channelName}"! Remember to follow our community norms.`);
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

    if (!agreedToNorms) {
      Alert.alert('Community Norms Required', 'Please review and agree to our community norms before creating a channel.');
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

      Alert.alert('Success', `Channel "${channelName}" created successfully! As the creator, please help maintain a positive community environment.`);
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
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.infoButton, { backgroundColor: Colors[theme].text + '20' }]}
            onPress={() => setShowNormsModal(true)}
          >
            <Text style={[styles.infoButtonText, { color: Colors[theme].text }]}>Norms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.plusButton, { backgroundColor: Colors.primary }]}
            onPress={handleCreateChannel}
          >
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, theme]);

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
    
      {/* Community Norms Modal */}
      <Modal
        visible={showNormsModal}
        animationType="slide"
        presentationStyle='pageSheet'
        onRequestClose={() => setShowNormsModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[theme].background }]}>
          <View style={[styles.modalHeader, {borderBottomColor: Colors[theme].text + '20' }]}>
            <TouchableOpacity onPress={() => setShowNormsModal(false)}>
              <Text style={[styles.cancelButton, { color: Colors[theme].text }]}>Close</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>Community Norms</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.normsContent}>
            <View style={styles.normsIntro}>
              <Text style={[styles.normsTitle, { color: Colors[theme].text }]}>
                Our Community Guidelines
              </Text>
              <Text style={[styles.normsSubtitle, { color: Colors[theme].text + '80' }]}>
                These norms help create a positive and respectful environment for everyone in our dorm community.
              </Text>
            </View>

            <View style={styles.normsList}>
              {communityNorms.map((norm, index) => (
                <View key={index} style={[styles.normItem, { borderLeftColor: Colors.primary }]}>
                  <Text style={[styles.normText, { color: Colors[theme].text }]}>
                    {norm}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.normsFooter, { backgroundColor: Colors[theme].background }]}>
              <Text style={[styles.normsFooterText, { color: Colors[theme].text + '60' }]}>
                By participating in channels, you agree to follow these community norms. 
                Violations may result in removal from channels or other moderation actions.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
                disabled={!channelName.trim() || !agreedToNorms}
              >
                <Text style={[
                  styles.createButton,
                  { 
                    color: (!channelName.trim() || !agreedToNorms) ? '#999' : Colors.primary,
                    opacity: (!channelName.trim() || !agreedToNorms) ? 0.6 : 1
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
                />
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

              {/* Community Norms Agreement */}
              <View style={[styles.formGroup, styles.normsAgreement]}>
                {/* <View style={styles.normsHeader}> */}
                  <Text style={[styles.formLabel, { color: Colors[theme].text, marginBottom: 8 }]}>
                    Community Norms Agreement *
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowNormsModal(true)}
                    style={styles.viewNormsButton}
                  >
                    <Text style={[styles.viewNormsText, { color: Colors.primary }]}>
                      View Norms
                    </Text>
                  </TouchableOpacity>
                {/* </View> */}
                
                <TouchableOpacity 
                  style={styles.agreementRow}
                  onPress={() => setAgreedToNorms(!agreedToNorms)}
                >
                  <View style={[
                    styles.checkbox, 
                    { 
                      borderColor: Colors[theme].text + '40',
                      backgroundColor: agreedToNorms ? Colors.primary : 'transparent'
                    }
                  ]}>
                    {agreedToNorms && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.agreementText, { color: Colors[theme].text }]}>
                    I agree to follow the community norms and help maintain a respectful environment
                  </Text>
                </TouchableOpacity>
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
              <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>Join Channel</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Community reminder for joining */}
            <View style={[styles.joinReminder, { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '30' }]}>
              <Text style={[styles.joinReminderText, { color: Colors[theme].text }]}>
                💡 Remember to follow our community norms when joining channels
              </Text>
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
                />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  infoButton: {
    width: 64,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 12,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: "bold",
  },
  normsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  normsIntro: {
    paddingVertical: 20,
  },
  normsTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  normsSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  normsList: {
    paddingBottom: 20,
  },
  normItem: {
    paddingLeft: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(123, 90, 255, 0.05)',
    borderRadius: 8,
  },
  normText: {
    fontSize: 15,
    lineHeight: 20,
  },
  normsFooter: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(123, 90, 255, 0.2)',
  },
  normsFooterText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  joinReminder: {
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  joinReminderText: {
    fontSize: 14,
    textAlign: 'center',
  },
  normsAgreement: {
    backgroundColor: 'rgba(123, 90, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123, 90, 255, 0.2)',
  },
  normsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewNormsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(123, 90, 255, 0.1)',
    marginBottom: 16,
  },
  viewNormsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
    paddingVertical: 12,
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
    paddingVertical: 12,
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
  createButton: {
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
  descriptionInput: {
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 20,
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