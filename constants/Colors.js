// Modern darker dorm life color palette
const tintColorLight = "#6C63FF"; // Deep purple/indigo
const tintColorDark = "#8F88FF"; // Lighter purple for dark mode

export default {
  // Base colors
  primary: "#7B5AFF", // Deep purple/indigo
  secondary: "#626988", // Muted slate
  success: "#2BD9A8", // Teal
  info: "#00C9FF", // Bright blue
  warning: "#FF8F6B", // Coral
  danger: "#FF5E93", // Pink
  
  // Neutrals
  light: "#2C2C3E", // Dark blue-gray (light mode background)
  dark: "#13131A", // Near black (dark mode background)
  
  // Light mode (actually darker theme)
  light: {
    text: "#FFFFFF", // White text
    background: "#2C2C3E", // Dark blue-gray
    tint: tintColorLight,
    tabIconDefault: "#7E7E95", // Muted purple-gray
    tabIconSelected: tintColorLight,
    cardBackground: "#3C3C50", // Slightly lighter than background
    borderColor: "#484860", // Medium gray with purple undertone
  },
  
  // Dark mode (even darker)
  dark: {
    text: "#FFFFFF", // White
    background: "#2D2B46", // Near black
    tint: tintColorDark,
    tabIconDefault: "#7E7E95", // Muted purple-gray
    tabIconSelected: tintColorDark,
    cardBackground: "#23232E", // Very dark gray
    borderColor: "#303045", // Dark border
  },
};