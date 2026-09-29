// Makes `localStorage` available on iOS and Android for the saved sign-in.
import '@/lib/local-storage';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    'Missing Supabase settings. Copy .env.example to .env.local, fill it in, and restart Expo.',
  );
}

/**
 * The app's connection to Supabase (database and sign-in). It uses the publishable
 * key, so it can only do what the database's row-level security rules allow.
 */
export const supabase = createClient(url, publishableKey, {
  auth: {
    // Undefined while a web page is pre-rendered on the server, where there's no
    // localStorage; Supabase then keeps the session in memory for that render.
    storage: globalThis.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Sign-in is by texted code, never by a link back into the app.
    detectSessionInUrl: false,
  },
});

// On iOS and Android, only refresh the sign-in while the app is on screen: timers
// don't run reliably in the background. The browser handles this itself on web.
if (process.env.EXPO_OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
