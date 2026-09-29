import { Image } from 'expo-image';
import { StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { Dish } from '@/data/lunchbox';
import { useTheme } from '@/hooks/use-theme';

type DishPhotoProps = {
  dish: Dish;
  /** Size it from outside, e.g. `{ width: '100%' }`; the photo is always square. */
  style?: StyleProp<ViewStyle & ImageStyle>;
};

/** The dish photo, or its first character on brand red until a photo is added. */
export function DishPhoto({ dish, style }: DishPhotoProps) {
  const theme = useTheme();

  if (dish.image) {
    return (
      <Image
        source={dish.image}
        style={[styles.photo, style]}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View style={[styles.photo, styles.placeholder, { backgroundColor: theme.primary }, style]}>
      <ThemedText style={[styles.placeholderText, { color: theme.onPrimary }]}>
        {dish.name.charAt(0)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    aspectRatio: 1,
    borderRadius: Radius.medium,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: 700,
  },
});
