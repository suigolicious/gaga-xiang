import { Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { NavigationThemes } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={NavigationThemes[colorScheme === 'dark' ? 'dark' : 'light']}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
