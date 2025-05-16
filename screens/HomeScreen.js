import React from "react";
import {
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from "react-native";
import { Text, View } from "../components/Themed";
import Svg, { Rect, Circle, Path } from "react-native-svg";
import Colors from "../constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';

const ChatIcon = ({ color }) => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" marginBottom={15}>
    <Path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" stroke={color} strokeWidth={4} />
    <Path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" stroke={color} strokeWidth={2} />
  </Svg>
);

const GalleryIcon = ({ color }) => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" marginBottom={15}>
    <Path d="M18 22H4a2 2 0 0 1-2-2V6" stroke={color} strokeWidth={2} />
    <Path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" stroke={color} strokeWidth={4} />
    <Circle cx="12" cy="8" r="2" fill={color} />
    <Rect width="16" height="16" x="6" y="2" rx="2" stroke={color} strokeWidth={2} />
  </Svg>
);



const CalendarIcon = ({ color }) => (
  // learn:     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" marginBottom={15}>
    <Path d="M8 2v4" stroke={color} strokeWidth={2} />
    <Path d="M16 2v4" stroke={color} strokeWidth={2} />
    <Rect width="18" height="18" x="3" y="4" rx="2" stroke={color} strokeWidth={2} />
    <Path d="M3 10h18" stroke={color} strokeWidth={2} />
    <Path d="M8 14h.01" stroke={color} strokeWidth={2} />
    <Path d="M12 14h.01" stroke={color} strokeWidth={2} />
    <Path d="M16 14h.01" stroke={color} strokeWidth={2} />
    <Path d="M8 18h.01" stroke={color} strokeWidth={2} />
    <Path d="M12 18h.01" stroke={color} strokeWidth={2} />
    <Path d="M16 18h.01" stroke={color} strokeWidth={2} />
  </Svg>
);

const ClassesIcon = ({ color }) => (
  // learn: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school-icon lucide-school"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg>
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" marginBottom={15}>
    <Path d="M14 22v-4a2 2 0 1 0-4 0v4" stroke={color} strokeWidth={2} />
    <Path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10" stroke={color} strokeWidth={2} />
    <Path d="M18 5v17" stroke={color} strokeWidth={2} />
    <Path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6" stroke={color} strokeWidth={2} />
    <Path d="M6 5v17" stroke={color} strokeWidth={2} />
    <Circle cx="12" cy="9" r="2" fill={color} />
  </Svg>
);

const MarketplaceIcon = ({ color }) => (
  <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
    <Rect x="10" y="10" width="30" height="30" rx="15" fill={color} />
    <Path d="M20 15L30 25L20 35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ResourcesIcon = ({ color }) => (
  <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
    <Rect x="10" y="15" width="30" height="25" rx="3" fill={color} />
    <Rect x="15" y="10" width="20" height="7" rx="2" fill={color} opacity={0.7} />
    <Rect x="15" y="25" width="20" height="3" rx="1.5" fill="#FFFFFF" />
    <Rect x="15" y="32" width="20" height="3" rx="1.5" fill="#FFFFFF" />
  </Svg>
);

// Feature grid item component
const FeatureItem = ({ title, Icon, onPress }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.featureItem,
        { backgroundColor: Colors[theme].cardBackground },
        pressed && {
          transform: [{ scale: 0.97 }],
          shadowColor: "#A58AFF",
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },        
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Icon color={Colors.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
    </Pressable>
  );
};

export default function HomeScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  const features = [
    { id: 1, title: "Chats", Icon: ChatIcon },
    { id: 2, title: "Gallery", Icon: GalleryIcon },
    { id: 3, title: "Calendar", Icon: CalendarIcon },
    { id: 4, title: "Dorm Classes", Icon: ClassesIcon },
    // { id: 5, title: "Marketplace", Icon: MarketplaceIcon },
    // { id: 6, title: "Resources", Icon: ResourcesIcon },
  ];

  const renderFeatures = () => {
    return features.map((feature) => (
      <FeatureItem
        key={feature.id}
        title={feature.title}
        Icon={feature.Icon}
        onPress={() => {
          if (feature.title === "Chats") navigation.navigate("ChannelsScreen");
          if (feature.title === "Gallery") navigation.navigate("GalleryScreen");
          if (feature.title === "Dorm Classes") navigation.navigate("ClassScreen");
        }}
      />
    ));
  };

  // Chat press handler
  const handleChatPress = () => {
    console.log('Pressed Chats');
    navigation.navigate('ChannelsScreen');
  };

  // Chat press handler
  const handleGalleryPress = () => {
    console.log('Pressed Gallery');
    navigation.navigate('GalleryScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <LinearGradient
        colors={["#7B5AFF", "#3B1AFA"]}
        style={styles.header}
      >
        <Text style={styles.title}>DormX</Text>
        <Text style={styles.subtitle}>Your Dorm Life Companion</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.featuresContainer}>
        {renderFeatures()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // backgroundColor: "#FFD9C3", // soft warm peach
    paddingTop: 30,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "rgba(240, 213, 220, 0.9)",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgb(228, 205, 113)",
    marginTop: 4,
  },
  
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 40,
    rowGap: 24, // better vertical spacing
  },
  
  featureItem: {
    width: "42%",
    aspectRatio: 1,
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    
  },
  featureTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
    color: "rgba(240, 213, 220, 0.9)",
  },
  
  
  iconContainer: {
    marginBottom: 12, // adds visual separation from text    
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  // Icon: { size: 440 } // bump up size slightly

});
