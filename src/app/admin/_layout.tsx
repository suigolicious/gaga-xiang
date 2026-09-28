import { Link, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

/** Dev-only shortcut back to the customer app, mirroring the admin link on Account. */
function CustomerAppLink() {
  return (
    <Link href="/" dismissTo>
      <ThemedText type="linkPrimary">Customer app</ThemedText>
    </Link>
  );
}

// TODO: gate these screens by user role once authentication is in place.
export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerRight: __DEV__ ? CustomerAppLink : undefined }}>
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="prep-sheet" options={{ title: 'Prep sheet' }} />
      <Stack.Screen name="packing" options={{ title: 'Packing list' }} />
      <Stack.Screen name="orders" options={{ title: 'Orders' }} />
      <Stack.Screen name="menu" options={{ title: 'Menu & capacity' }} />
      <Stack.Screen name="deliveries" options={{ title: 'Deliveries' }} />
    </Stack>
  );
}
