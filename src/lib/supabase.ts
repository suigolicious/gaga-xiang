// Gives iOS and Android a `localStorage` (backed by SQLite) for the saved sign-in.
// On web it does nothing: the browser's own localStorage is used.
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

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
