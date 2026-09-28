import '@/i18n';

import { Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { NavigationThemes } from '@/constants/theme';
import { LanguageProvider } from '@/i18n/language-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <LanguageProvider>
      <ThemeProvider value={NavigationThemes[colorScheme === 'dark' ? 'dark' : 'light']}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </LanguageProvider>
  );
}
