import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { QuantityStepper } from '@/components/menu/quantity-stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import type { MenuItem } from '@/data/fake-menu';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';
import { formatPrice } from '@/lib/format';

type MenuItemCardProps = {
  item: MenuItem;
  quantity: number;
  canIncrement: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function MenuItemCard({
  item,
  quantity,
  canIncrement,
  onIncrement,
  onDecrement,
}: MenuItemCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <DishImage item={item} />
      <View style={styles.details}>
        <ThemedText type="smallBold">{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {item.description[language]}
        </ThemedText>
        <View style={styles.footer}>
          <ThemedText type="smallBold">{formatPrice(item.priceCents)}</ThemedText>
          <QuantityStepper
            quantity={quantity}
            canIncrement={canIncrement}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            addLabel={t('menu.add', { name: item.name })}
            removeLabel={t('menu.remove', { name: item.name })}
            quantityLabel={t('menu.quantity', { count: quantity })}
          />
        </View>
      </View>
    </ThemedView>
  );
}

/** The dish photo, or its first character on brand red until a photo is added. */
export function DishImage({ item, size = 88 }: { item: MenuItem; size?: number }) {
  const theme = useTheme();
  const box = { width: size, height: size };

  if (item.image) {
    return <Image source={item.image} style={[styles.image, box]} contentFit="cover" />;
  }
  return (
    <View style={[styles.image, styles.placeholder, box, { backgroundColor: theme.primary }]}>
      <ThemedText
        style={[
          styles.placeholderText,
          { color: theme.onPrimary, fontSize: size * 0.4, lineHeight: size * 0.5 },
        ]}>
        {item.name.charAt(0)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.three,
    gap: Spacing.three,
    borderRadius: Radius.large,
  },
  image: {
    borderRadius: Radius.medium,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontWeight: 700,
  },
  details: {
    flex: 1,
    gap: Spacing.one,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: Spacing.two,
  },
});
