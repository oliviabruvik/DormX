import React, { use, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import Colors from '../constants/Colors';
import { Avatar, Button, Card, Title, Paragraph, Searchbar, Text as PaperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ChannelsScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const { user } = useAuth();

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadChannels = async () => {
    try {
      console.log('Loading channels');
      setLoading(true);
      
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
    } finally {
      setLoading(false);
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