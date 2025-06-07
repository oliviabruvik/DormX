import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import Colors from '../constants/Colors';
import { Avatar, Button, Card, Title, Paragraph, Searchbar, TextInput, Text as PaperText, Menu, Divider, IconButton } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { createdAt } from 'expo-updates';

export default function ChatsScreen({ navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const scrollViewRef = useRef(null);

  const { user, userProfile } = useAuth();

  const { channelName = 'General' } = route.params || {};

  const [chats, setChats] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const loadChats = async() => {
    try {
      console.log('Loading chats for channel:', channelName);
      
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('channel_name', channelName)
        .order('created_at', { ascending: true });

      if (chatsError) {
        console.error('Error loading chats:', chatsError);
        Alert.alert('Error', 'Failed to load chats');
        return;
      }

      if (chatsData && chatsData.length > 0) {
        const userIds = [...new Set(chatsData.map(chat => chat.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
        }

        const { data: flaggedChats, error: flaggedError } = await supabase
          .from('flagged_chats')
          .select('*')
          .eq('user_id', user.id);

        if (flaggedError) {
          console.error('Error loading flagged chats:', flaggedError);
        }

        console.log('Flagged chats:', flaggedChats);

        // Combine chats with profile data
        const chatsWithProfiles = chatsData.map(chat => ({
          ...chat,
          profiles: profilesData?.find(profile => profile.id === chat.user_id) || null,
          flagged: flaggedChats?.some(flagged => flagged.chat_id === chat.id) || false,
          deleted_at: flaggedChats?.find(flagged => flagged.chat_id === chat.id)?.deleted_at || null
        }));

        // filter out deleted chats
        const filteredChats = chatsWithProfiles.filter(chat => chat.deleted_at === null);

        console.log('Loaded chats:', filteredChats);
        setChats(filteredChats || []);
      }
    } catch (chatsError) {
      console.error('Unexpected error loading chats:', chatsError);
      Alert.alert('Error', 'Failed to load chats');
    }
  }

  const viewProfile = async (userId) => {
    if (userId === user.id) {
      // Don't show profile modal for current user
      return;
    }

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        Alert.alert('Error', 'Failed to load user profile');
        return;
      }

      setSelectedUserProfile(profileData);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    }
  };

  const getAvatarText = (profile) => {
    if (!profile) return 'U';
    if (profile.name) {
      return profile.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    }
    return 'U';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };

  // Function to add a new message
  const addMessage = async (messageText) => {
    if (!messageText.trim()) {
      return;
    }
    if (!user || !userProfile) {
      Alert.alert('Error', 'You must be logged in to send messages!');
      return;
    }

    try {
      console.log('Sending message:', messageText);

      const newMessage = {
        created_by: user.id,
        user_id: user.id,
        user_name: userProfile.name || user.email?.split('@')[0] || 'You',
        channel_name: channelName,
        message: messageText.trim()
      };

      const { data, error } = await supabase
        .from('chats')
        .insert([newMessage])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error)
        Alert.alert('Error', 'Failed to send message');
        return;
      }

      console.log('Message sent successfully:', data);

      const newMessageWithProfile = {
          ...data,
          profiles: {
            id: user.id,
            name: userProfile.name,
            avatar_url: userProfile.avatar_url
          }
        };
      
      setChats(prevChats => [...prevChats, newMessageWithProfile]);
      
      // Scroll to bottom after adding message
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 100);

    } catch (error) {
      console.error('Unexpected error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting message:', error);
        Alert.alert('Error', 'Failed to delete message');
        return;
      }

      setChats(prevChats => prevChats.filter(chat => chat.id !== messageId));
      setShowMenu(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Unexpected error deleting message:', error);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const editMessage = async (messageId, newText) => {
    if (!newText.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chats')
        .update({
          message: newText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error editing message:', error);
        Alert.alert('Error', 'Failed to edit message');
        return;
      }

      setChats(prevChats =>
        prevChats.map(chat => 
          chat.id === messageId 
            ? { ...chat, message: newText.trim(), updated_at: data.updated_at }
            : chat
        )
      );

      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Unexpected error editing message:', error);
      Alert.alert('Error', 'Failed to edit message');
    }
  };

  const handleLongPress = (chat) => {
    if (chat.user_id === user?.id) {
      setSelectedMessage(chat);
      setShowMenu(true);
    }
  };

  const handleDelete = () => {
    if (selectedMessage) {
      Alert.alert(
        'Delete Message',
        'Are you sure you wnat to delete this message?',
        [
          { text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteMessage(selectedMessage.id)
          }
        ]
      );
    }
  };

  const handleEdit = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage.id);
      setEditText(selectedMessage.message);
      setShowMenu(false);
      setSelectedMessage(null);
    }
  }

  const saveEdit = () => {
    if (editingMessage && editText.trim()) {
      editMessage(editingMessage, editText);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  }

  // Profile detail modal component
  const ProfileDetailModal = ({ profile, onClose }) => (
    <Modal
      visible={showProfileModal}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.profileModalContent, { backgroundColor: Colors[theme].cardBackground }]}>
          <View style={styles.profileModalHeader}>
            <Text style={[styles.profileModalTitle, { color: Colors[theme].text }]}>
              Profile Details
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.profileCloseButton}>
              <Text style={styles.profileCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.profileModalBody}>

            {/* Name and basic info */}
            <Text style={[styles.profileModalName, { color: Colors[theme].text }]}>
              {profile.name || 'No name set'}
            </Text>
            
            {profile.is_ra && (
              <View style={styles.profileRaBadge}>
                <Text style={styles.profileRaBadgeText}>RA</Text>
              </View>
            )}

            {profile.bio && (
              <Text style={[styles.profileModalBio, { color: Colors[theme].text }]}>
                {profile.bio}
              </Text>
            )}

            {/* Details */}
            <View style={styles.profileModalDetails}>
              {profile.dorm_name && (
                <View style={styles.profileDetailRow}>
                  <Text style={[styles.profileDetailLabel, { color: Colors[theme].text }]}>Dorm:</Text>
                  <Text style={[styles.profileDetailValue, { color: Colors[theme].text }]}>
                    {profile.dorm_name} {profile.room_number && `#${profile.room_number}`}
                  </Text>
                </View>
              )}
              
              {profile.year_in_school && (
                <View style={styles.profileDetailRow}>
                  <Text style={[styles.profileDetailLabel, { color: Colors[theme].text }]}>Year:</Text>
                  <Text style={[styles.profileDetailValue, { color: Colors[theme].text }]}>
                    {profile.year_in_school}
                  </Text>
                </View>
              )}
              
              {profile.major && (
                <View style={styles.profileDetailRow}>
                  <Text style={[styles.profileDetailLabel, { color: Colors[theme].text }]}>Major:</Text>
                  <Text style={[styles.profileDetailValue, { color: Colors[theme].text }]}>
                    {profile.major}
                  </Text>
                </View>
              )}

              <View style={styles.profileDetailRow}>
                <Text style={[styles.profileDetailLabel, { color: Colors[theme].text }]}>Member Since:</Text>
                <Text style={[styles.profileDetailValue, { color: Colors[theme].text }]}>
                  {formatDate(profile.created_at)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );


    // Helper function to render avatar
  const renderAvatar = (chat) => {
    const profileData = chat.profiles || {};
    // const avatarUrl = profileData.avatar_url;
    const userName = profileData.name || chat.user_name || 'Unknown';
    
    // if (avatarUrl) {
    //   return (
    //     <Image 
    //       source={{ uri: avatarUrl }} 
    //       style={styles.avatarImage}
    //       onError={() => {
    //         console.log('Failed to load avatar image for:', userName);
    //       }}
    //     />
    //   );
    // } else {
      return (
        <View style={styles.chatAvatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
      );
    // }
  };

  // Helper function to get display name
  const getDisplayName = (chat) => {
    return chat.profiles?.name || chat.user_name || 'Unknown User';
  };

  // Text input component
  const TextInputComponent = () => {
    const [text, setText] = useState("");
  
    const handleSend = () => {
      if (text.trim()) {
        addMessage(text);
        setText(""); // Clear input after sending
      }
    };

    return (
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            label="New message..."
            value={text}
            onChangeText={setText}
            autoFocus={false}
            style={styles.textInput}
            onSubmitEditing={handleSend}
            multiline={false}
          />
          <Button 
            mode="contained" 
            onPress={handleSend}
            disabled={!text.trim()}
            style={styles.sendButton}
          >
            Send
          </Button>
        </View>
      </View>
    );
  };

  const handleFlagMessage = async (chat) => {
    try {
      // Check if chat is already flagged by this user
      if (chat.flagged) {
        // If already flagged, unflag it
        await handleUnflagMessage(chat);
      } else {
        // If not flagged, flag it
        await handleAddFlag(chat);
      }
    } catch (error) {
      console.error('Unexpected error handling flag:', error);
      Alert.alert('Error', 'Failed to handle flag');
    }
  };

  const handleAddFlag = async (chat) => {
    try {
      // Add chat to flagged_chats table
      const { error: flagError } = await supabase
        .from('flagged_chats')
        .insert({
          chat_id: chat.id,
          user_id: user.id,
          flagged_at: new Date().toISOString()
        });

      console.log('Adding flag... with user id:', user.id, 'and chat id:', chat.id);

      if (flagError) {
        console.error('Error flagging message:', flagError);
        Alert.alert('Error', 'Failed to flag message');
        return;
      }

      // Update local state
      setChats(prevChats =>
        prevChats.map(c => 
          c.id === chat.id 
            ? { ...c, flagged: true }
            : c
        )
      );

      Alert.alert('Success', 'Message flagged successfully');
      console.log('Message flagged successfully');
    } catch (error) {
      console.error('Unexpected error adding flag:', error);
      Alert.alert('Error', 'Failed to flag message');
    }
  };

  const handleUnflagMessage = async (chat) => {
    try {

      // Remove from flagged_chats table
      const { error: unflagError } = await supabase
        .from('flagged_chats')
        .delete()
        .eq('chat_id', chat.id);
        //.eq('user_id', user.id);

      console.log('Unflagging message... with user id:', user.id, 'and chat id:', chat.id);

      if (unflagError) {
        console.error('Error unflagging message:', unflagError);
        Alert.alert('Error', 'Failed to unflag message');
        return;
      }

      // Update local state
      setChats(prevChats =>
        prevChats.map(c => 
          c.id === chat.id 
            ? { ...c, flagged: false }
            : c
        )
      );

      Alert.alert('Success', 'Message unflagged successfully');
      console.log('Message unflagged successfully');
    } catch (error) {
      console.error('Unexpected error removing flag:', error);
      Alert.alert('Error', 'Failed to unflag message');
    }
  };

  // Update the flag icon to show filled or outlined based on whether the current user has flagged it
  const renderFlagIcon = (chat) => {
    const isFlagged = chat.flagged;
    return (
      <IconButton
        icon={isFlagged ? "flag" : "flag-outline"}
        size={16}
        iconColor={isFlagged ? Colors.primary : Colors.secondary}
        style={styles.flagIcon}
        onPress={() => handleFlagMessage(chat)}
      />
    );
  };

  useEffect(() => {
    loadChats();
  }, [channelName]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }, 100);
    }
  }, []);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 125}
    >   

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
      >
        {chats.map(chat => (
          <TouchableOpacity
            key={chat.id}
            onLongPress={() => handleLongPress(chat)}
            activeOpacity={0.7}
          >
            <View 
              style={[
                styles.chatItem, 
                { backgroundColor: Colors[theme].cardBackground },
                chat.user_id === user?.id && styles.ownMessage
              ]}
            >
            <View style={styles.avatarContainer}>{renderAvatar(chat)}</View>
            <View style={[styles.chatContent, { backgroundColor: 'transparent' }]}>
              <View style={[styles.chatHeader, { backgroundColor: 'transparent' }]}>
                <TouchableOpacity onPress={() => viewProfile(chat.user_id)}>
                <Text style={styles.chatName}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {getDisplayName(chat)}</Text>
                </TouchableOpacity>
                <View style={styles.headerRight}>
                  <Text style={styles.chatTime}>
                    {chat.created_at ? new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'} 
                    {chat.updated_at && chat.updated_at !== chat.created_at && (<Text style={styles.editedText}> (edited)</Text>)}
                  </Text>
                  {renderFlagIcon(chat)}
                </View>
              </View>
              {editingMessage === chat.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      value={editText}
                      onChangeText={setEditText}
                      style={styles.editInput}
                      multiline
                      autoFocus
                    />
                    <View style={styles.editButtons}>
                      <Button 
                        mode="outlined" 
                        onPress={cancelEdit}
                        style={styles.cancelButton}
                        compact
                      >
                        Cancel
                      </Button>
                      <Button 
                        mode="contained" 
                        onPress={saveEdit}
                        style={styles.saveButton}
                        compact
                      >
                        Save
                      </Button>
                    </View>
                  </View>
                ) : (
                  <Text 
                    style={styles.chatMessage}
                    ellipsizeMode="tail"
                  >
                    {chat.message || "No messages yet"}
                  </Text>
                )}
            </View>
          </View>
        </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Context Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.contextMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Text style={styles.menuItemText}>Edit Message</Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Text style={[styles.menuItemText, styles.deleteText]}>Delete Message</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Detail Modal */}
      {selectedUserProfile && (
        <ProfileDetailModal 
          profile={selectedUserProfile} 
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUserProfile(null);
          }} 
        />
      )}

      <TextInputComponent />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 10,
  },
  header: {
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  headerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 24,
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
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flexShrink: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
    padding_right: 10,
  },
  chatMessage: {
    fontSize: 14,
    color: 'white',
  },
  editContainer: {
    marginTop: 5,
  },
  editInput: {
    backgroundColor: 'white',
    marginBottom: 10,
    fontSize: 14,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: '#666',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: '#d32f2f',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    margin: 0,
    marginLeft: 4,
  },
    // Profile Modal Styles
  profileModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  profileModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCloseButton: {
    padding: 8,
  },
  profileCloseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileModalBody: {
    padding: 20,
  },
  profileModalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
  },
  profileModalAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileModalName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileRaBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    marginBottom: 12,
  },
  profileRaBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileModalBio: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
    opacity: 0.8,
  },
  profileModalDetails: {
    marginTop: 8,
  },
  profileDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  profileDetailLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  profileDetailValue: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
});