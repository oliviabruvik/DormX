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

const ClassHeader = () => {
    return (
        <View style={styles.header}>
            <PaperText style={styles.headerText}>My Classes</PaperText>
        </View>
    );
};

const LeftContent = props => <Avatar.Icon {...props} icon="folder" />

const ClassItem = ({ title, subtitle, numStudents }) => {
    return (
    <Card>
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

// Feature grid item component
const FeatureItem = ({ title, AnimatedIcon, onPress }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  return (
    <TouchableOpacity 
      style={[
        styles.featureItem, 
        { backgroundColor: Colors[theme].cardBackground }
      ]} 
      onPress={onPress}
    >
      <AnimatedIcon color={Colors.primary} />
      <Text style={styles.featureTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function ClassScreenTwo({ navigation }) {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    
    // Features data with animated components
    const classes = [
      { id: 1, title: "CS 106B", Professor: "John Doe", NumStudents: 45 },
      { id: 2, title: "Math 51", Professor: "Jane Smith", NumStudents: 30 },
      { id: 3, title: "English 91", Professor: "Alice Johnson", NumStudents: 25 },
      { id: 4, title: "Dorm Classes", Professor: "Bob Brown", NumStudents: 10 },
      { id: 5, title: "Marketplace", Professor: "Charlie Davis", NumStudents: 15 },
    ];
  
    // Render grid of features
    const renderClasses = () => {
      return classes.map((feature) => (
        <ClassItem
          key={feature.id}
          title={feature.title}
          Professor={feature.Professor}
          NumStudents={feature.NumStudents}
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
      <ScrollView>
        <ClassHeader />
        <ClassSearchBar />
        <View>{renderClasses()}</View>
      </ScrollView>
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
  },
  headerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 5,
  },
  classesContainer: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  classItem: {
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: "100%", // Reverted back to "100%" to make cards take up the whole space
  },
  classTitle: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
    color: "white",
  },
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    minWidth: 150,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  welcomeCard: {
    margin: 16,
    elevation: 4,
  },
});