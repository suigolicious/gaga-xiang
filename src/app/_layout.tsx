import '@/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/auth-provider';
import { NavigationThemes } from '@/constants/theme';
import { LanguageProvider } from '@/i18n/language-provider';
import { queryClient } from '@/lib/query-client';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider value={NavigationThemes[colorScheme === 'dark' ? 'dark' : 'light']}>
            <RootStack />
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function RootStack() {
  const { ready, isAdmin } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
      {/* Hides admin from everyone else, sending them to the lunchbox instead. This only
          shapes the app: row-level security is what protects admin data. Allowed while
          the saved sign-in is still loading, so an admin reloading /admin stays there. */}
      <Stack.Protected guard={isAdmin || !ready}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
