import React from 'react';
import { View, StyleSheet, useColorScheme, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Colors from '../constants/Colors';
import { TextInput, Text as PaperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
// import { OPENAI_API_KEY } from '@env';

const GPT_MODEL = "gpt-4.1"
const OPENAI_API_KEY = "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"

// function to fetch user info from supabase
async function fetchUserInfo(user) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id);
  if (error) {
    console.error('Error fetching user info:', error);
  }
  console.log('Fetched user info:', data);
  return data;
}

// function to fetch class id's that user is enrolled in from supabase
async function fetchClassEnrollmentData(user) {
  const { data, error } = await supabase.from('class_enrollments').select('*').eq('user_id', user.id);
  console.log('Fetched class enrollment data:', data);
  
  // get class id's from data
  const classIds = data.map(item => item.class_id);
  console.log('Class IDs:', classIds);

  if (error) {
    console.error('Error fetching class enrollment data:', error);
  }
  return classIds;
}

// function to fetch class data from supabase
async function fetchClassData(classIds) {
  const { data, error } = await supabase.from('classes').select('*').in('id', classIds);
  console.log('Fetched class data:', data);

  // get class name, class description, class professor, class time, class location
  const relevantClassData = data.map(item => {
    return {
      name: item.name,
      instructor_name: item.instructor_name,
      current_students: item.current_students,
    }
  });
  console.log('Relevant class data:', relevantClassData);
  return relevantClassData;
}

async function fetchChatResponse(userMessage, userData, classData) {

  // add all user data to the message as context
  const userMessageWithContext = `User info: ${JSON.stringify(userData)}\n Class info: ${JSON.stringify(classData)}\n User message: ${userMessage}`;
  console.log(userMessageWithContext);

  // route to openai api whether user message is about class or not
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: GPT_MODEL, // or 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: userMessageWithContext }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

const MessageBubble = ({ message, isUser, theme }) => (
  <View style={[
    styles.messageBubble,
    isUser ? styles.userBubble : styles.assistantBubble,
    { backgroundColor: isUser ? Colors.primary : Colors[theme].cardBackground }
  ]}>
    <PaperText style={[
      styles.messageText,
      { color: isUser ? 'white' : Colors[theme].text }
    ]}>
      {message}
    </PaperText>
  </View>
);

export default function TabTwoScreen() {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const [messages, setMessages] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollViewRef = React.useRef();

  // Header component
  const AIHeader = () => {
    if (messages.length > 0) return null;
    
    return (
      <View style={styles.header}>
        <PaperText style={styles.headerText}>Ask any question about the dorm!</PaperText>
      </View>
    );
  };

  const AIAssistant = () => {
    const [text, setText] = React.useState("");
    const { user } = useAuth();
    const [userData, setUserData] = React.useState(null);
    const [classEnrollmentData, setClassEnrollmentData] = React.useState(null);
    const [classData, setClassData] = React.useState(null);

    // fetch user data
    React.useEffect(() => {
      const loadUserData = async () => {
        if (user) {
          const data = await fetchUserInfo(user);
          setUserData(data);
        }
      };
      loadUserData();
    }, [user]);

    // fetch class enrollment data
    React.useEffect(() => {
      const loadClassEnrollmentData = async () => {
        if (user) {
          const data = await fetchClassEnrollmentData(user);
          setClassEnrollmentData(data);
        }
      };
      loadClassEnrollmentData();
    }, [user]);

    // fetch class data
    React.useEffect(() => {
      const loadClassData = async () => {
        if (classEnrollmentData) {
          const data = await fetchClassData(classEnrollmentData);
          setClassData(data);
        }
      };
      loadClassData();
    }, [classEnrollmentData]);

    const handleSubmit = async () => {
      if (!text.trim()) return;
      
      const userMessage = text.trim();
      setText("");
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setIsLoading(true);

      try {
        const response = await fetchChatResponse(userMessage, userData, classData);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } catch (error) {
        console.error('Error fetching chat response:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <MessageBubble 
              key={index}
              message={message.content}
              isUser={message.role === 'user'}
              theme={theme}
            />
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <PaperText style={styles.loadingText}>Thinking...</PaperText>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            label="Ask AI"
            value={text}
            onChangeText={setText}
            style={styles.textInput}
            onSubmitEditing={handleSubmit}
            disabled={isLoading}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={handleSubmit}
                disabled={isLoading || !text.trim()}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <AIHeader />
      <AIAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    width: '70%',
    alignSelf: 'center',
    marginTop: 200,
  },
  headerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  textInput: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
});
