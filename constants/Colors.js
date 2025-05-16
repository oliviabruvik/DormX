const tintColorLight = "#FF6B3C"; // Bright orange-coral
const tintColorDark = "#FF8B61";  // Soft sunset orange

export default {
  // Core theme colors
  primary: "#FF5C2A",        // Vivid tangerine
  secondary: "#FF944D",      // Warm apricot
  success: "#FFB84C",        // Golden honey
  info: "#FFA686",           // Soft clay-peach
  warning: "#FFD166",        // Vibrant sunshine
  danger: "#FF4D5B",         // Warm cherry red

  // Neutrals for structure
  light: "#FFF5ED",          // Bright cream
  dark: "#1F130E",           // Espresso brown

  // Light mode
  light: {
    text: "#3B1E14",               // Deep coffee brown
    background: "#FFF1E8",         // Light peach base
    tint: tintColorLight,
    tabIconDefault: "#C86B45",     // Muted clay
    tabIconSelected: tintColorLight,
    cardBackground: "#FFDAC7",     // Soft apricot card
    borderColor: "#FFBFA6",        // Peach outline
    mutedText: "#9C6652",
    placeholder: "#C49785",
  },

  // Dark mode
  dark: {
    text: "#FFFFFF",
    background: "#2A150F",         // Dark terracotta
    tint: tintColorDark,
    tabIconDefault: "#FF9E7A",
    tabIconSelected: tintColorDark,
    cardBackground: "#3D1E15",     // Cocoa backdrop
    borderColor: "#6B392A",        // Burnt sienna
    mutedText: "#D79E8D",
    placeholder: "#A67160",
  },
};
