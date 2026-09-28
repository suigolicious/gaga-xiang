import { Link } from 'expo-router';

import { PlaceholderScreen } from '@/components/placeholder-screen';
import { ThemedText } from '@/components/themed-text';

export default function AccountScreen() {
  return (
    <PlaceholderScreen
      title="Account"
      description="Sign in, delivery address, and notification settings.">
      {/* Admin is reachable in development until role-based sign-in exists. */}
      {__DEV__ && (
        <Link href="/admin">
          <ThemedText type="linkPrimary">Open admin (dev only)</ThemedText>
        </Link>
      )}
    </PlaceholderScreen>
  );
}
