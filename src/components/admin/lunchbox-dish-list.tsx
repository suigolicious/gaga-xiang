import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { IconButton } from '@/components/button';
import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { SortableList } from '@/components/sortable-list';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Dish } from '@/data/lunchbox';

const PHOTO_SIZE = 56;

type LunchboxDishListProps = {
  /** In the order customers see them. */
  dishes: Dish[];
  onChange: (dishes: Dish[]) => void;
};

/** The dishes in a day's lunchbox: drag a dish's handle to reorder it, or remove it. */
export function LunchboxDishList({ dishes, onChange }: LunchboxDishListProps) {
  const { t } = useTranslation();

  if (dishes.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        {t('admin.lunchbox.noDishes')}
      </ThemedText>
    );
  }

  return (
    <>
      {dishes.length > 1 && (
        <ThemedText type="small" themeColor="textSecondary">
          {t('admin.lunchbox.dragHint')}
        </ThemedText>
      )}
      <SortableList
        items={dishes}
        keyOf={(dish) => dish.id}
        rowHeight={PHOTO_SIZE + Spacing.two * 2}
        onReorder={onChange}
        labels={{
          handle: (dish) => t('admin.lunchbox.reorder', { name: dish.name }),
          moveUp: (dish) => t('admin.lunchbox.moveUp', { name: dish.name }),
          moveDown: (dish) => t('admin.lunchbox.moveDown', { name: dish.name }),
        }}
        renderItem={(dish) => (
          <>
            <DishPhoto dish={dish} style={styles.photo} />
            <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
              {dish.name}
            </ThemedText>
            <IconButton
              symbol="✕"
              onPress={() => onChange(dishes.filter((other) => other.id !== dish.id))}
              accessibilityLabel={t('admin.lunchbox.removeDish', { name: dish.name })}
            />
          </>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: PHOTO_SIZE,
  },
  name: {
    flex: 1,
  },
});
