import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Avatar, Button, Card, Title, Paragraph, Searchbar, Text as PaperText } from 'react-native-paper';

export default function ChannelsScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  // Header component
  const ChannelsHeader = () => {
    return (
        <View style={styles.header}>
            <PaperText style={styles.headerText}>My Channels</PaperText>
        </View>
    );
  };
  // Sample chat data (you would replace this with real data)
  const channels = [
    { id: 1, name: 'Resident Assistants'},
    { id: 2, name: 'Floor 1'},
    { id: 3, name: 'Floor 2'},
    { id: 4, name: 'Floor 3'},
    { id: 5, name: 'Dorm Committee'},
    { id: 6, name: 'Events'},
    { id: 7, name: 'Announcements'},
    { id: 8, name: 'General'},
    { id: 9, name: 'Lockouts'}
  ];

  // Chat press handler
  const handleChatPress = (channelName) => {
    console.log('Pressed', channelName);
    navigation.navigate('ChatsScreen', { channelName});
    }; 

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

  return (
    // put in safe view
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ScrollView>
        <ChannelsHeader />
        <View style={styles.featuresContainer}>{renderFeatures()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});