import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { DishDetails } from '@/components/lunchbox/dish-details';
import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import type { Dish, Lunchbox } from '@/data/lunchbox';
import { useLanguage } from '@/i18n/language-provider';
import { formatPrice } from '@/lib/format';

/** Two dishes side by side, four as a 2×2 grid, otherwise up to three per row. */
function columnsFor(count: number) {
  if (count <= 2) return count;
  if (count === 4) return 2;
  return 3;
}

type LunchboxCardProps = {
  lunchbox: Lunchbox;
  priceCents: number;
};

/** What's in the lunchbox: a photo and name for each dish, then the sides and price. */
export function LunchboxCard({ lunchbox, priceCents }: LunchboxCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [openDish, setOpenDish] = useState<Dish | null>(null);
  const tileWidth = `${100 / columnsFor(lunchbox.dishes.length)}%` as const;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.grid}>
        {lunchbox.dishes.map((dish) => (
          <Pressable
            key={dish.id}
            onPress={() => setOpenDish(dish)}
            role="button"
            aria-label={t('lunchbox.dishDetails', { name: dish.name })}
            style={({ pressed }) => [styles.tile, { width: tileWidth }, pressed && styles.pressed]}>
            <DishPhoto dish={dish} style={styles.photo} />
            <ThemedText type="smallBold" style={styles.dishName}>
              {dish.name}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          {lunchbox.sides[language]}
        </ThemedText>
        <ThemedText type="smallBold">
          {t('lunchbox.perBox', { price: formatPrice(priceCents) })}
        </ThemedText>
      </View>
      <DishDetails dish={openDish} onClose={() => setOpenDish(null)} />
    </ThemedView>
  );
}

const TILE_GUTTER = Spacing.two;

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
    borderRadius: Radius.large,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Tiles pad themselves by half the gutter; this cancels it at the card's edges.
    margin: -TILE_GUTTER / 2,
    rowGap: Spacing.two,
  },
  tile: {
    padding: TILE_GUTTER / 2,
    gap: Spacing.two,
  },
  photo: {
    width: '100%',
  },
  dishName: {
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.8,
  },
});
