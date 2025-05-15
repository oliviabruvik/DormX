import "react-native-gesture-handler";

import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, Platform } from "react-native";
import { PaperProvider } from 'react-native-paper';

import { useLoadedAssets } from "./hooks/useLoadedAssets";
import Navigation from "./navigation";
import Colors from "./constants/Colors";

export default function App() {
  const isLoadingComplete = useLoadedAssets();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <PaperProvider>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar 
            style="light"
            backgroundColor={Colors.primary}
          />
        </SafeAreaProvider>
      </PaperProvider>
    );
  }
}