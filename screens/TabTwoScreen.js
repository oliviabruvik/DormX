import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { TextInput, Text as PaperText } from 'react-native-paper';


export default function TabTwoScreen() {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  // Header component
  const AIHeader = () => {
    return (
        <View style={styles.header}>
            <PaperText style={styles.headerText}>Ask any question about the dorm!</PaperText>
        </View>
    );
  };

  const AIAssistant = () => {
    const [text, setText] = React.useState("");
  
    return (
      <TextInput
        label="Ask AI"
        value={text}
        onChangeText={text => setText(text)}
        style={styles.textInput}
      />
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
});
