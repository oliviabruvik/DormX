import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

export default function ChatsScreen({ navigation, route}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const { channelName = 'General' } = route.params || {};
  
  // Sample chat data (you would replace this with real data)
  const chats = [
    { id: 1, name: 'User 1 ', lastMessage: '', time: '10:30 AM' },
    { id: 2, name: 'User 2', lastMessage: 'Super long message just to see what happens how many lines can it go to?', time: 'Monday' },
    { id: 3, name: 'Super long user name just to see what happens how many lines can it go to?', lastMessage: 'message', time: 'Two Days Ago' },
    { id: 4, name: 'User 3', lastMessage: 'Temp Message', time: 'Sunday' },
    { id: 5, name: 'User 3' },
    { id: 6, name: 'User 1' },
    { id: 7, name: 'User 2' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>   
      <ScrollView style={styles.chatList}>
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
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {chat.lastMessage || "No messages yet"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatList: {
    flex: 1,
    padding: 10,
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
    color: '#666',
  },
});