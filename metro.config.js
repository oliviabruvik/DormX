// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve node_modules that might cause issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add resolver configuration to avoid Node.js modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle problematic packages
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
];

module.exports = config;