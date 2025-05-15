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

// Animated Chat Icon Component
const ChatAnimation = ({ color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 1000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        {/* Base bubble */}
        <Rect x="5" y="10" width="40" height="30" rx="15" fill={color} opacity={0.8} />
        
        {/* Animated bubble */}
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Circle cx="20" cy="25" r="4" fill="#FFFFFF" />
            <Circle cx="30" cy="25" r="4" fill="#FFFFFF" />
            <Circle cx="40" cy="25" r="4" fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
};

// Animated Gallery Icon Component
const GalleryAnimation = ({ color }) => {
  const rotate = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.iconContainer}>
      <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <Rect x="10" y="10" width="15" height="15" rx="2" fill={color} />
        <Rect x="30" y="10" width="10" height="10" rx="2" fill={color} opacity={0.7} />
        <Rect x="10" y="30" width="10" height="10" rx="2" fill={color} opacity={0.7} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Rect x="25" y="25" width="15" height="15" rx="2" fill="#FFFFFF" opacity={0.9} />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
};

// Animated Calendar Icon Component
const CalendarAnimation = ({ color }) => {
  const scale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <Rect x="10" y="10" width="30" height="30" rx="3" fill={color} />
        <Rect x="10" y="10" width="30" height="7" rx="2" fill={color} opacity={0.7} />
        <Animated.View style={{ transform: [{ scale }] }}>
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Circle cx="25" cy="27" r="5" fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
};

// Animated Classes Icon Component
const ClassesAnimation = ({ color }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 5,
          duration: 1000,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -5,
          duration: 1000,
          easing: Easing.in(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 1000,
          easing: Easing.in(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <Rect x="10" y="15" width="30" height="20" rx="3" fill={color} />
        <Animated.View style={{ transform: [{ translateX }] }}>
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Rect x="15" y="20" width="20" height="3" rx="1.5" fill="#FFFFFF" />
            <Rect x="15" y="26" width="20" height="3" rx="1.5" fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
};

// Animated Marketplace Icon Component
const MarketplaceAnimation = ({ color }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <Rect x="10" y="10" width="30" height="30" rx="15" fill={color} />
        <Animated.View style={{ opacity }}>
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Path d="M20 15L30 25L20 35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
  );
};

// Animated Resources Icon Component
const ResourcesAnimation = ({ color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -3,
          duration: 700,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.iconContainer}>
      <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <Rect x="10" y="15" width="30" height="25" rx="3" fill={color} />
        <Rect x="15" y="10" width="20" height="7" rx="2" fill={color} opacity={0.7} />
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Rect x="15" y="25" width="20" height="3" rx="1.5" fill="#FFFFFF" />
            <Rect x="15" y="32" width="20" height="3" rx="1.5" fill="#FFFFFF" />
          </Svg>
        </Animated.View>
      </Svg>
    </View>
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

export default function HomeScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  // Features data with animated components
  const features = [
    { id: 1, title: "Chats", AnimatedIcon: ChatAnimation },
    { id: 2, title: "Gallery", AnimatedIcon: GalleryAnimation },
    { id: 3, title: "Calendar", AnimatedIcon: CalendarAnimation },
    { id: 4, title: "Dorm Classes", AnimatedIcon: ClassesAnimation },
    { id: 5, title: "Marketplace", AnimatedIcon: MarketplaceAnimation },
    { id: 6, title: "Resources", AnimatedIcon: ResourcesAnimation },
  ];

  // Render grid of features
  const renderFeatures = () => {
    return features.map((feature) => (
      <FeatureItem
        key={feature.id}
        title={feature.title}
        AnimatedIcon={feature.AnimatedIcon}
        onPress={() => {
          console.log(`Pressed ${feature.title}`);
          if (feature.title === "Chats") {
            navigation.navigate('ChannelsScreen')
          }
          if (feature.title === "Gallery") {
            navigation.navigate('GalleryScreen')
          }
          if (feature.title === "Dorm Classes") {
            navigation.navigate('ClassScreen')
          }
        }
      }
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
    // put in safe view
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors.primary }]}>
        <Text style={styles.title}>DormX</Text>
        <Text style={styles.subtitle}>Your Dorm Life Companion</Text>
      </View>

      <ScrollView>
        <View style={styles.featuresContainer}>{renderFeatures()}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
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
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  featureItem: {
    width: "30%",
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
  },
  featureTitle: {
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
});