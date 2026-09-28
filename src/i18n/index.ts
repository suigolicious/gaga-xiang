import { getLocales, type Locale } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import en from './locales/en';
import zhHans from './locales/zh-Hans';

export const Languages = ['en', 'zh-Hans'] as const;
export type Language = (typeof Languages)[number];

/** Each language's name written in that language, for the language picker. */
export const LanguageNames: Record<Language, string> = {
  en: 'English',
  'zh-Hans': '简体中文',
};

export const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
} as const;

/**
 * Picks the app language from the device's preferred languages. Any Chinese
 * locale (including Traditional) uses Simplified Chinese; anything else is English.
 */
export function resolveDeviceLanguage(locales: readonly Locale[] = getLocales()): Language {
  return locales[0]?.languageCode === 'zh' ? 'zh-Hans' : 'en';
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  // Web pages are pre-rendered without a browser, so start in English there and
  // switch after hydration (see LanguageProvider). Native can use the device language right away.
  lng: Platform.OS === 'web' ? 'en' : resolveDeviceLanguage(),
  fallbackLng: 'en',
  initAsync: false,
  interpolation: {
    // React already escapes rendered strings.
    escapeValue: false,
  },
});

export default i18n;
