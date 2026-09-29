import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

/**
 * Caches data loaded from Supabase and refetches it when it may be stale. Browsers
 * tell React Query when the tab regains focus; on iOS and Android the equivalent is
 * the app coming back to the foreground, which has to be wired up by hand.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The menu, locations, and settings change at most a few times a day.
      staleTime: 60_000,
      // Supabase already retries failed reads 3 times (after 1s, 2s, 4s). Retrying here
      // too multiplies that, leaving customers waiting over 30 seconds for an error.
      retry: false,
    },
  },
});

if (process.env.EXPO_OS !== 'web') {
  AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'));
}
