import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import type { Dish } from '@/data/lunchbox';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';

type DishDetailsProps = {
  /** The dish to show, or null when closed. */
  dish: Dish | null;
  onClose: () => void;
};

/** A larger photo and the description of one dish, over the lunchbox screen. */
export function DishDetails({ dish, onClose }: DishDetailsProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();

  return (
    // `onRequestClose` handles Android's back button.
    <Modal visible={dish !== null} transparent animationType="fade" onRequestClose={onClose}>
      {/* Tapping the dimmed area around the card closes it. */}
      <Pressable style={styles.backdrop} onPress={onClose} aria-label={t('lunchbox.close')}>
        {dish && (
          // Swallows taps so pressing the card itself doesn't close it.
          <Pressable onPress={() => {}} style={styles.cardPressable}>
            <ThemedView style={styles.card}>
              <DishPhoto dish={dish} style={styles.photo} />
              <ThemedText type="smallBold">{dish.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{dish.description[language]}</ThemedText>
              <Pressable
                onPress={onClose}
                role="button"
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">{t('lunchbox.close')}</ThemedText>
              </Pressable>
            </ThemedView>
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardPressable: {
    width: '100%',
    maxWidth: 400,
    cursor: 'auto',
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  photo: {
    width: '100%',
    marginBottom: Spacing.one,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.7,
  },
});
