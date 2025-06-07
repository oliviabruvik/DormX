// Updated BottomTabNavigator.js - Add CalendarScreen
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native";

import Colors from "../constants/Colors";
import HomeScreen from "../screens/HomeScreen";
import ChatsScreen from "../screens/ChatsScreen";
import ChannelsScreen from "../screens/ChannelsScreen";
import GalleryScreen from "../screens/GalleryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ClassScreen from "../screens/ClassScreen";
import CalendarScreen from "../screens/CalendarScreen"; // Add this import
import ModerationScreen from "../screens/ModerationScreen";
import TabTwoScreen from "../screens/TabTwoScreen";
import MembersScreen from "../screens/MembersScreen";

const BottomTab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors[theme]?.tint || Colors.primary,
        tabBarInactiveTintColor: Colors[theme]?.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[theme]?.cardBackground,
          borderTopColor: Colors[theme]?.cardBackground,
          borderTopWidth: 1,
          paddingBottom: 9,
          paddingTop: 5,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Explore"
        component={ExploreNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="search" color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person" color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

function TabBarIcon(props) {
  return <Ionicons size={26} style={{ marginBottom: -3 }} {...props} />;
}

// Home navigator stack - Add CalendarScreen here
const HomeStack = createStackNavigator();
function HomeNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false, headerTitle: "Home"}}
      />
      <HomeStack.Screen
        name="ChannelsScreen" 
        component={ChannelsScreen}
        options={{ headerTitle: "Channels" }}
      />
      <HomeStack.Screen
        name="ChatsScreen" 
        component={ChatsScreen}
        options={({ route }) => ({ 
          headerTitle: route.params?.channelName || "Chats" 
        })}
      />
      <HomeStack.Screen
        name="GalleryScreen" 
        component={GalleryScreen}
        options={{ headerTitle: "Gallery" }}
      />
      <HomeStack.Screen
        name="CalendarScreen" 
        component={CalendarScreen}
        options={{ 
          headerShown: false // We use custom header in CalendarScreen
        }}
      />
      <HomeStack.Screen
        name="ClassScreen" 
        component={ClassScreen}
        options={{ headerTitle: "Dorm Classes" }}
      />
      <HomeStack.Screen
        name="ModerationScreen" 
        component={ModerationScreen}
        options={{ headerTitle: "Moderation" }}
      />
      <HomeStack.Screen
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{ headerTitle: "Profile" }}
      />
      <HomeStack.Screen
        name="MembersScreen" 
        component={MembersScreen}
        options={{ headerTitle: "Members" }}
      />
    </HomeStack.Navigator>
  );
}

// Explore navigator stack (placeholder)
const ExploreStack = createStackNavigator();
function ExploreNavigator() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <ExploreStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <ExploreStack.Screen
        name="ExploreScreen"
        component={TabTwoScreen}
        options={{ headerTitle: "Explore" }}
      />
    </ExploreStack.Navigator>
  );
}

// Profile navigator stack - Updated with new ProfileScreen
const ProfileStack = createStackNavigator();
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerTitle: "Profile" }} // ProfileScreen has custom header too
      />
    </ProfileStack.Navigator>
  );
}