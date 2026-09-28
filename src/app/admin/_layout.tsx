import { Stack } from 'expo-router';

// TODO: gate these screens by user role once authentication is in place.
export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="prep-sheet" options={{ title: 'Prep sheet' }} />
      <Stack.Screen name="packing" options={{ title: 'Packing list' }} />
      <Stack.Screen name="orders" options={{ title: 'Orders' }} />
      <Stack.Screen name="menu" options={{ title: 'Menu & capacity' }} />
      <Stack.Screen name="deliveries" options={{ title: 'Deliveries' }} />
    </Stack>
  );
}
