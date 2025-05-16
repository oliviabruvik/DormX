import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { Avatar, Button, Card, Title, Paragraph, Searchbar, TextInput, Text as PaperText } from 'react-native-paper';

export default function ChatsScreen({ navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const scrollViewRef = useRef(null);

  const { channelName = 'General' } = route.params || {};

  // Header component
  const ChatsHeader = () => {
    return (
        <View style={styles.header}>
            <PaperText style={styles.headerText}>My Chats</PaperText>
        </View>
    );
  };

  // Text input component
  const TextInputComponent = () => {
    const [text, setText] = React.useState("");
  
    return (
      <View style={styles.inputContainer}>
        <TextInput
          label="New message..."
          value={text}
          onChangeText={text => setText(text)}
          autoFocus={true}
          style={styles.textInput}
        />
      </View>
    );
  };
  
  // Sample chat data (you would replace this with real data)
  const chats = [
    { id: 1, name: 'Olivia Beyer Bruvik', lastMessage: 'Reminder: Floor meeting tonight at 8pm in the common room', time: '10:30 AM' },
    { id: 2, name: 'Yousef AbuHashem', lastMessage: 'Can someone cover my duty shift this Saturday? Family emergency', time: 'Monday' },
    { id: 3, name: 'Renee White', lastMessage: 'Just did room checks - all good on 3rd floor', time: 'Two Days Ago' },
    { id: 4, name: 'Olivia Beyer Bruvik', lastMessage: 'Heads up: maintenance coming tomorrow to fix the washing machines', time: 'Sunday' },
    { id: 5, name: 'Leslie Jin', lastMessage: 'Need help with a resident situation on 2nd floor', time: 'Yesterday' },
    { id: 6, name: 'Leslie Jin', lastMessage: 'Updated duty schedule posted in the RA office', time: 'Last Week' },
    { id: 7, name: 'Yousef AbuHashem', lastMessage: 'Fire alarm test scheduled for next Tuesday at 2pm', time: 'Last Week' }
  ];

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
        {/* <ChatsHeader /> */}
        {chats.map(chat => (
          <View 
            key={chat.id} 
            style={[styles.chatItem, { backgroundColor: Colors[theme].cardBackground }]}
          >
            <View style={styles.chatAvatar}>
              <Text style={styles.avatarText}>{chat.name.charAt(0)}</Text>
            </View>
            <View style={[styles.chatContent, { backgroundColor: 'transparent' }]}>
              <View style={[styles.chatHeader, { backgroundColor: 'transparent' }]}>
                <Text style={styles.chatName}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time} </Text>
              </View>
              <Text 
                style={styles.chatMessage}
                ellipsizeMode="tail"
              >
                {chat.lastMessage || "No messages yet"}
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