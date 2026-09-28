/**
 * Design tokens for the app. Colors are sampled from the 嘎嘎香 logo:
 * lacquer red, cream lettering, terracotta outline, and gold trim.
 *
 * Change a value here and every screen picks it up — this is the place to
 * experiment with the look before real screens exist.
 */

import '@/global.css';

import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { Platform } from 'react-native';

/** Raw brand colors. Screens should use the semantic `Colors` below instead. */
export const Palette = {
  red: '#A8100A',
  cream: '#F5E8D6',
  terracotta: '#A85A36',
  gold: '#F0C084',
} as const;

export const Colors = {
  light: {
    text: '#2B1611',
    textSecondary: '#7A5A4A',
    background: '#FBF4EA',
    backgroundElement: '#F3E6D3',
    backgroundSelected: '#EAD6BC',
    border: '#E2CDB2',
    /** Filled buttons and brand surfaces */
    primary: Palette.red,
    /** Text and icons drawn on top of `primary` */
    onPrimary: Palette.cream,
    /** Links, active tab, and other highlighted text or icons */
    tint: Palette.red,
    accent: Palette.terracotta,
  },
  dark: {
    text: Palette.cream,
    textSecondary: '#C4AB96',
    background: '#1A0F0C',
    backgroundElement: '#2A1915',
    backgroundSelected: '#3A241D',
    border: '#4A3027',
    primary: Palette.red,
    onPrimary: Palette.cream,
    // Brand red is too dark to read as text on a dark background, so highlights use gold.
    tint: Palette.gold,
    accent: '#E0A866',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Themes for Expo Router's navigators (headers, tab bars, screen backgrounds). */
export const NavigationThemes: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.background,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.primary,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.tint,
      background: Colors.dark.background,
      card: Colors.dark.background,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.primary,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 20,
  pill: 999,
} as const;

/** Keeps content readable on wide screens (web, tablets). */
export const MaxContentWidth = 800;
