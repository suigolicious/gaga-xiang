import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import i18n, { Languages, resolveDeviceLanguage, type Language } from '@/i18n';

/** 'system' follows the phone's language; otherwise the user picked one explicitly. */
export type LanguagePreference = 'system' | Language;

const STORAGE_KEY = 'language-preference';

function isLanguagePreference(value: string | null): value is LanguagePreference {
  return value === 'system' || Languages.includes(value as Language);
}

type LanguageContextValue = {
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Keep the native splash screen up until the saved language is loaded, so the
// app never flashes in the wrong language. No-op on web.
SplashScreen.preventAutoHideAsync();

export function LanguageProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');
  const [loaded, setLoaded] = useState(false);
  // Re-renders when the phone's language changes (Android can change it while the app runs).
  const locales = useLocales();

  const language = preference === 'system' ? resolveDeviceLanguage(locales) : preference;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isLanguagePreference(saved)) setPreferenceState(saved);
      })
      .catch(() => {
        // Storage unavailable: fall back to the phone's language.
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
    if (process.env.EXPO_OS === 'web') document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  const setPreference = (next: LanguagePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Not saved; the choice still applies for this session.
    });
  };

  return <LanguageContext value={{ preference, setPreference }}>{children}</LanguageContext>;
}

export function useLanguagePreference() {
  const context = use(LanguageContext);
  if (!context) throw new Error('useLanguagePreference must be used inside LanguageProvider');
  return context;
}
