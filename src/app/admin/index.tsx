import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';

const SECTIONS: { href: Href; title: string; description: string }[] = [
  { href: '/admin/prep-sheet', title: 'Prep sheet', description: 'What to cook tomorrow' },
  { href: '/admin/packing', title: 'Packing list', description: 'Per-customer orders' },
  { href: '/admin/orders', title: 'Orders', description: 'Manage orders and refunds' },
  { href: '/admin/menu', title: 'Menu & capacity', description: 'Dishes and the daily cap' },
  { href: '/admin/deliveries', title: 'Deliveries', description: 'Morning stop list' },
];

export default function AdminHomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {SECTIONS.map((section) => (
          <Link key={section.title} href={section.href} asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedText type="smallBold">{section.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {section.description}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        ))}
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
  pressed: {
    opacity: 0.7,
  },
});
