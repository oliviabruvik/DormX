import React, { useRef, useEffect, useState } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  useColorScheme,
  Modal,
  Alert,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import { SegmentedButtons, Divider } from 'react-native-paper';
import Colors from "../constants/Colors";
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const SegmentedMenu = ({ selectedSegment, setSelectedSegment }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <SegmentedButtons
        value={selectedSegment}
        onValueChange={setSelectedSegment}
        buttons={[
          {
            value: 'flagged',
            label: 'Flagged',
            style: { backgroundColor: selectedSegment === 'flagged' ? Colors.primary : 'transparent' },
            labelStyle: { color: selectedSegment === 'flagged' ? 'white' : Colors[theme].text }
          },
          {
            value: 'resolved',
            label: 'Resolved',
            style: { backgroundColor: selectedSegment === 'resolved' ? Colors.primary : 'transparent' },
            labelStyle: { color: selectedSegment === 'resolved' ? 'white' : Colors[theme].text }
          },
          {
            value: 'deleted',
            label: 'Deleted',
            style: { backgroundColor: selectedSegment === 'deleted' ? Colors.primary : 'transparent' },
            labelStyle: { color: selectedSegment === 'deleted' ? 'white' : Colors[theme].text }
          }
        ]}
        style={styles.segmentedButtons}
      />
    </View>
  );
};

export default function ModerationScreen({ navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const scrollViewRef = useRef(null);

  const { user, userProfile } = useAuth();

  const { channelName = 'General' } = route.params || {};

  // Sample chat data (you would replace this with real data)
  const [allChannels, setAllChannels] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [resolvingMessage, setResolvingMessage] = useState(null);
  const [deletedChats, setDeletedChats] = useState([]);
  const [resolvedChats, setResolvedChats] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('flagged');

  const getAllChannels = async() => {
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*');

    if (channelsError) {
      console.error('Error loading channels:', channelsError);
    }

    // console.log('All channels:', channels);
    setAllChannels(channels);
  };

  const loadFlaggedChatsForChannel = async() => {
    try {
      console.log('Loading chats for all channels');
      
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

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
          .select('*');

        if (flaggedError) {
          console.error('Error loading flagged chats:', flaggedError);
        }

        // Get all resolver and deleter IDs
        const resolverIds = [...new Set(flaggedChats?.map(chat => chat.resolved_by).filter(Boolean) || [])];
        const deleterIds = [...new Set(flaggedChats?.map(chat => chat.deleted_by).filter(Boolean) || [])];
        
        // Fetch profiles for resolvers and deleters
        const { data: resolverProfiles, error: resolverError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', [...new Set([...resolverIds, ...deleterIds])]);

        if (resolverError) {
          console.error('Error loading resolver profiles:', resolverError);
        }

        // Combine chats with profile data
        const chatsWithProfiles = chatsData.map(chat => {
          const flaggedChat = flaggedChats?.find(flagged => flagged.chat_id === chat.id);
          return {
            ...chat,
            profiles: profilesData?.find(profile => profile.id === chat.user_id) || null,
            flagged: flaggedChats?.some(flagged => flagged.chat_id === chat.id) || false,
            resolved_at: flaggedChat?.resolved_at || null,
            deleted_at: flaggedChat?.deleted_at || null,
            resolved_by: flaggedChat?.resolved_by || null,
            deleted_by: flaggedChat?.deleted_by || null,
            resolver_name: resolverProfiles?.find(profile => profile.id === flaggedChat?.resolved_by)?.name || null,
            deleter_name: resolverProfiles?.find(profile => profile.id === flaggedChat?.deleted_by)?.name || null
          };
        });

        // filter flagged chats to only include flagged chats
        const onlyFlaggedChats = chatsWithProfiles.filter(chat => chat.flagged);

        setChats(onlyFlaggedChats || []);
      }
    } catch (chatsError) {
      console.error('Unexpected error loading chats:', chatsError);
      Alert.alert('Error', 'Failed to load chats');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      // Delete from flagged_chats table
      const { error: deleteError } = await supabase
        .from('flagged_chats')
        .update({
          deleted_by: user.id,
          deleted_at: new Date().toISOString()
        })
        .eq('chat_id', messageId);

      if (deleteError) {
        console.error('Error deleting message:', deleteError);
        Alert.alert('Error', 'Failed to delete message');
        return;
      }

      // Update local state
      setChats(prevChats =>
        prevChats.map(chat => 
          chat.id === messageId 
            ? { 
                ...chat,
                deleted_at: new Date().toISOString(),
                deleted_by: user.id,
              }
            : chat
        )
      );

      // setChats(prevChats => prevChats.filter(chat => chat.id !== messageId));
      setShowMenu(false);
      setSelectedMessage(null);
      console.log('Message with id:', messageId, 'deleted successfully');
    } catch (error) {
      console.error('Unexpected error deleting message with id:', messageId, error);
      Alert.alert('Error', 'Failed to delete message');
    }
  };

  const resolveMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('flagged_chats')
        .update({
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('chat_id', messageId);

      if (error) {
        console.error('Error resolving message:', error);
        Alert.alert('Error', 'Failed to resolve message');
        return;
      }

      // Update local state
      setChats(prevChats =>
        prevChats.map(chat => 
          chat.id === messageId 
            ? { 
                ...chat,
                resolved_at: new Date().toISOString(),
                resolved_by: user.id,
              }
            : chat
        )
      );

      setResolvingMessage(null);
      console.log('Message resolved successfully');
    } catch (error) {
      console.error('Unexpected error resolving message:', error);
      Alert.alert('Error', 'Failed to resolve message');
    }
  };

  const handleLongPress = (chat) => {
    setSelectedMessage(chat);
    setShowMenu(true);
  };

  const handleDelete = () => {
    if (selectedMessage) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
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

  const handleResolve = () => {
    if (selectedMessage) {
      setResolvingMessage(selectedMessage.id);
      resolveMessage(selectedMessage.id);
      setShowMenu(false);
      setSelectedMessage(null);
    }
  };

  // Helper function to render avatar
  const renderAvatar = (chat) => {
    const profileData = chat.profiles || {};
    const avatarUrl = profileData.avatar_url;
    const userName = profileData.name || chat.user_name || 'Unknown';
    
    if (avatarUrl) {
      return (
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatarImage}
          onError={() => {
            console.log('Failed to load avatar image for:', userName);
          }}
        />
      );
    } else {
      return (
        <View style={styles.chatAvatar}>
          <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
        </View>
      );
    }
  };

  // Helper function to get display name
  const getDisplayName = (chat) => {
    return chat.profiles?.name || chat.user_name || 'Unknown User';
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
        .eq('chat_id', chat.id)
        .eq('user_id', user.id)
        .select()
        .single();

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

  useEffect(() => {
    loadFlaggedChatsForChannel();
  }, [channelName]);

  useEffect(() => {
    getAllChannels();
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
        <SegmentedMenu 
          selectedSegment={selectedSegment}
          setSelectedSegment={setSelectedSegment}
        />
        {allChannels.map((channel, index) => {
          const channelMessages = chats
            .filter(chat => {
              if (chat.channel_name !== channel.name) return false;
              
              switch (selectedSegment) {
                case 'flagged':
                  return chat.resolved_at === null && chat.deleted_at === null;
                case 'resolved':
                  return chat.resolved_at !== null;
                case 'deleted':
                  return chat.deleted_at !== null;
                default:
                  return false;
              }
            })
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          if (channelMessages.length === 0) return null;

          return (
            <View key={channel.id}>
              {index > 0 && <View style={styles.channelDivider} />}
              <View style={styles.channelHeader}>
                <Text style={styles.channelHeaderText}>{channel.name}</Text>
              </View>
              {channelMessages.map(chat => (
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
                        <Text style={styles.chatName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {getDisplayName(chat)}
                        </Text>
                        <View style={styles.headerRight}>
                          <Text style={styles.chatTime}>
                            {chat.created_at ? new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'} 
                            {chat.updated_at && chat.updated_at !== chat.created_at && (<Text style={styles.editedText}> (edited)</Text>)}
                          </Text>
                        </View>
                      </View>
                      <Text 
                        style={styles.chatMessage}
                        ellipsizeMode="tail"
                      >
                        {chat.message || "No messages yet"}
                      </Text>
                      {selectedSegment === 'resolved' && chat.resolver_name && (
                        <Text style={styles.actionInfo}>
                          Resolved by {chat.resolver_name}
                        </Text>
                      )}
                      {selectedSegment === 'deleted' && chat.deleter_name && (
                        <Text style={styles.actionInfo}>
                          Deleted by {chat.deleter_name}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
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
            <TouchableOpacity style={styles.menuItem} onPress={handleResolve}>
              <Text style={styles.menuItemText}>Resolve Message</Text>
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Text style={[styles.menuItemText, styles.deleteText]}>Delete Message</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    channelDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 20,
    },
    channelHeader: {
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        marginBottom: 10,
    },
    channelHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    segmentedMenu: {
        padding: 15,
    },
    segmentedButtons: {
        marginBottom: 10,
    },
    actionInfo: {
        fontSize: 12,
        color: Colors.secondary,
        marginTop: 4,
        fontStyle: 'italic'
    },
});