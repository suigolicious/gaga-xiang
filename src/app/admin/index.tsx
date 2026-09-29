import { Link, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { LanguagePicker } from '@/components/language-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

const SECTIONS = [
  { href: '/admin/prep-sheet', key: 'prepSheet' },
  { href: '/admin/packing', key: 'packing' },
  { href: '/admin/orders', key: 'orders' },
  { href: '/admin/menu', key: 'menu' },
  { href: '/admin/deliveries', key: 'deliveries' },
] as const satisfies readonly { href: Href; key: string }[];

export default function AdminHomeScreen() {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {SECTIONS.map((section) => (
          <Link key={section.key} href={section.href} asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedText type="smallBold">{t(`admin.${section.key}.title`)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t(`admin.${section.key}.summary`)}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        ))}
        <ThemedView style={styles.settings}>
          <LanguagePicker />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.half,
  },
  settings: {
    marginTop: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
