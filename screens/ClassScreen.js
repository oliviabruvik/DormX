import React, { useRef, useEffect } from "react";
import { 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Easing,
  useColorScheme
} from "react-native";
import { Text, View } from "../components/Themed";
import Svg, { Circle, Path, Rect, G } from "react-native-svg";
import Colors from "../constants/Colors";
import { Avatar, Button, Card, Title, Paragraph, Searchbar, Text as PaperText } from 'react-native-paper';

import { PaperProvider } from 'react-native-paper';

// Search bar component
const ClassSearchBar = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
  
    return (
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
    );
};

// Header component
const ClassHeader = () => {
    return (
        <View style={styles.header}>
            <PaperText style={styles.headerText}>My Classes</PaperText>
        </View>
    );
};

// Folder icon component
const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

// Class item component
const ClassItem = ({ title, subtitle, numStudents }) => {
    return (
    <Card style={styles.card}>
        <Card.Title title={title} subtitle={subtitle} left={LeftContent} />
        <Card.Content>
            <PaperText variant="bodyMedium">Number of Students: {numStudents}</PaperText>
        </Card.Content>
        <Card.Actions>
            <Button>Enter Community</Button>
        </Card.Actions>
    </Card>
    );
};

// Class screen
export default function ClassScreen({ navigation }) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    
    // Features data with animated components
    const classes = [
      { id: 1, title: "CS 278", Professor: "Professor Michael Bernstein", NumStudents: 45 },
      { id: 2, title: "CS 109", Professor: "Professor Jerry Cain", NumStudents: 30 },
      { id: 3, title: "English 91", Professor: "Professor John Evans", NumStudents: 25 },
      { id: 4, title: "CS 103", Professor: "Professor Cynthia Bailey", NumStudents: 45 },
    ];
  
    // Render grid of features
    const renderClasses = () => {
      return classes.map((feature) => (
        <ClassItem
          key={feature.id}
          title={feature.title}
          subtitle={feature.Professor}
          numStudents={feature.NumStudents}
          //onPress={() => {
            //           console.log(`Pressed ${feature.title}`);
            //           if (feature.title === "Chats") {
            //             navigation.navigate('ChatsScreen')
            //           }
            //           if (feature.title === "Gallery") {
            //             navigation.navigate('GalleryScreen')
            //           }
            //           if (feature.title === "Dorm Classes") {
            //             navigation.navigate('ClassScreen')
            //           }
        />
      ));
    };


  // Chat press handler
  const handleChatPress = () => {
    console.log('Pressed Chats');
    navigation.navigate('ChatsScreen');
  };

  // Chat press handler
  const handleGalleryPress = () => {
    console.log('Pressed Gallery');
    navigation.navigate('GalleryScreen');
  };

  return (
    // put in safe view
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ClassHeader />
        <ClassSearchBar />
        <View style={styles.classesContainer}>{renderClasses()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  classesContainer: {
    paddingBottom: 20,
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
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});