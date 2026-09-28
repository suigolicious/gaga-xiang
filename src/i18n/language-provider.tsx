import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import i18n, { Languages, resolveDeviceLanguage, type Language } from '@/i18n';

const STORAGE_KEY = 'language-preference';

function isLanguage(value: string | null): value is Language {
  return Languages.includes(value as Language);
}

type LanguageContextValue = {
  /** The language the app is currently shown in. */
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Keep the native splash screen up until the saved language is loaded, so the
// app never flashes in the wrong language. No-op on web.
SplashScreen.preventAutoHideAsync();

export function LanguageProvider({ children }: PropsWithChildren) {
  // null until the user picks a language; until then the app follows the phone.
  const [chosen, setChosen] = useState<Language | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Re-renders when the phone's language changes (Android can change it while the app runs).
  const locales = useLocales();

  const language = chosen ?? resolveDeviceLanguage(locales);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (isLanguage(saved)) setChosen(saved);
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

  const setLanguage = (next: Language) => {
    setChosen(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Not saved; the choice still applies for this session.
    });
  };

  return <LanguageContext value={{ language, setLanguage }}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = use(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
