import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/button';
import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import type { Dish } from '@/data/lunchbox';

type LunchboxDishListProps = {
  /** In the order customers see them. */
  dishes: Dish[];
  onChange: (dishes: Dish[]) => void;
};

/** The dishes in a day's lunchbox, with buttons to reorder or remove each one. */
export function LunchboxDishList({ dishes, onChange }: LunchboxDishListProps) {
  const { t } = useTranslation();

  if (dishes.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        {t('admin.lunchbox.noDishes')}
      </ThemedText>
    );
  }

  const move = (from: number, to: number) => {
    const next = [...dishes];
    const [dish] = next.splice(from, 1);
    next.splice(to, 0, dish);
    onChange(next);
  };

  return (
    <View style={styles.list}>
      {dishes.map((dish, index) => (
        <ThemedView key={dish.id} type="backgroundElement" style={styles.row}>
          <DishPhoto dish={dish} style={styles.photo} />
          <ThemedText type="smallBold" style={styles.name}>
            {dish.name}
          </ThemedText>
          <View style={styles.actions}>
            <IconButton
              symbol="↑"
              onPress={() => move(index, index - 1)}
              disabled={index === 0}
              accessibilityLabel={t('admin.lunchbox.moveUp', { name: dish.name })}
            />
            <IconButton
              symbol="↓"
              onPress={() => move(index, index + 1)}
              disabled={index === dishes.length - 1}
              accessibilityLabel={t('admin.lunchbox.moveDown', { name: dish.name })}
            />
            <IconButton
              symbol="✕"
              onPress={() => onChange(dishes.filter((other) => other.id !== dish.id))}
              accessibilityLabel={t('admin.lunchbox.removeDish', { name: dish.name })}
            />
          </View>
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.medium,
  },
  photo: {
    width: 56,
  },
  name: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
