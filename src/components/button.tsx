import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Primary is the screen's main action, filled in brand red. */
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  /** For screen readers when the label alone is ambiguous, e.g. "Add Garlic Lettuce". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** A pill-shaped text button in the app's colors. */
export function Button({
  label,
  onPress,
  variant = 'secondary',
  disabled,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      role="button"
      aria-label={accessibilityLabel}
      aria-disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primary ? theme.primary : theme.backgroundSelected },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <ThemedText type="smallBold" style={{ color: primary ? theme.onPrimary : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type IconButtonProps = {
  /** A single character, e.g. "↑". */
  symbol: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/** A small round button showing one symbol, for compact row actions. */
export function IconButton({ symbol, onPress, accessibilityLabel, disabled }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      role="button"
      aria-label={accessibilityLabel}
      aria-disabled={disabled}
      hitSlop={Spacing.one}
      style={({ pressed }) => [
        styles.icon,
        { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <ThemedText style={styles.symbol}>{symbol}</ThemedText>
    </Pressable>
  );
}

const ICON_SIZE = 36;

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 600,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.35,
  },
});
