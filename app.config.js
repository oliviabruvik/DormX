// app.config.js
import 'dotenv/config';

const appJson = require('./app.json');

// Merge with environment variables
export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    plugins: [
      ...appJson.expo.plugins //,
      //'expo-auth-session', // Add this if not already in app.json
    ],
    extra: {
      ...appJson.expo.extra,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};