import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { TextLink } from '@/components/text-link';
import { Spacing } from '@/constants/theme';

/** Dev-only shortcut back to the customer app, mirroring the admin link on Account. */
function CustomerAppLink() {
  const { t } = useTranslation();
  return (
    <TextLink href="/" dismissTo style={styles.link}>
      {t('admin.customerApp')}
    </TextLink>
  );
}

// TODO: gate these screens by user role once authentication is in place.
export default function AdminLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerRight: __DEV__ ? CustomerAppLink : undefined }}>
      <Stack.Screen
        name="index"
        options={{
          title: t('admin.title'),
          // On web, "back" from the admin home just leads to the customer app, which the
          // header link already covers. Native keeps its standard back button and gesture.
          headerLeft: process.env.EXPO_OS === 'web' ? () => null : undefined,
        }}
      />
      <Stack.Screen name="prep-sheet" options={{ title: t('admin.prepSheet.title') }} />
      <Stack.Screen name="packing" options={{ title: t('admin.packing.title') }} />
      <Stack.Screen name="orders" options={{ title: t('admin.orders.title') }} />
      <Stack.Screen name="menu" options={{ title: t('admin.menu.title') }} />
      <Stack.Screen name="deliveries" options={{ title: t('admin.deliveries.title') }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  // Native headers pad their right-hand items; the web header doesn't.
  link: process.env.EXPO_OS === 'web' ? { paddingHorizontal: Spacing.three } : {},
});
