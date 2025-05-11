// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

let storage: unknown;

// Only on native (iOS/Android), pull in the URL polyfill + AsyncStorage
if (Platform.OS !== 'web') {
  // bring in the URL polyfill
  require('react-native-url-polyfill/auto');
  
  // bring in AsyncStorage as the storage adapter
  storage = require('@react-native-async-storage/async-storage').default;
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      // on web: storage is undefined → supabase-js will use localStorage/cookies
      // on native: storage is AsyncStorage
      storage,
    },
  }
);
