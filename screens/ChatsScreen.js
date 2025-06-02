import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import Colors from '../constants/Colors';
import { Avatar, Button, Card, Title, Paragraph, Searchbar, TextInput, Text as PaperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { createdAt } from 'expo-updates';

export default function ChatsScreen({ navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const scrollViewRef = useRef(null);

  const { user, userProfile } = useAuth();

  const { channelName = 'General' } = route.params || {};

  // Sample chat data (you would replace this with real data)
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);

  const loadChats = async() => {
    try {
      console.log('Loading chats for channel:', channelName);
      setLoading(true);
      
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('channel_name', channelName)
        .order('created_at', { ascending: true });

      if (chatsError) {
        console.error('Error loading chats:', error);
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

        // Combine chats with profile data
        const chatsWithProfiles = chatsData.map(chat => ({
          ...chat,
          profiles: profilesData?.find(profile => profile.id === chat.user_id) || null
        }));

      console.log('Loaded chats:', chatsWithProfiles);
      setChats(chatsWithProfiles || []);
      }
    } catch (chatsError) {
      console.error('Unexpected error loading chats:', chatsError);
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }

  // Function to add a new message
  const addMessage = async (messageText) => {
    if (!messageText.trim()) return;
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >   

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
      >
        {chats.map(chat => (
          <View 
            key={chat.id} 
            style={[styles.chatItem, { backgroundColor: Colors[theme].cardBackground }]}
          >
            <View style={styles.avatarContainer}>{renderAvatar(chat)}</View>
            <View style={[styles.chatContent, { backgroundColor: 'transparent' }]}>
              <View style={[styles.chatHeader, { backgroundColor: 'transparent' }]}>
                <Text style={styles.chatName}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {getDisplayName(chat)}</Text>
                <Text style={styles.chatTime}>{chat.created_at ? new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time'} </Text>
              </View>
              <Text 
                style={styles.chatMessage}
                ellipsizeMode="tail"
              >
                {chat.message || "No messages yet"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  inputContainer: {
    padding: 2,
    backgroundColor: Colors.primary,
  },
  textInput: {
    backgroundColor: 'white',
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
});