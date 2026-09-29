import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  /** Defaults to true; turn off to keep a minimum, e.g. at least one lunchbox. */
  canDecrement?: boolean;
  addLabel: string;
  removeLabel: string;
  quantityLabel: string;
};

/** A single "+" button at zero, expanding to "− n +" once something is added. */
export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement = true,
  addLabel,
  removeLabel,
  quantityLabel,
}: QuantityStepperProps) {
  const theme = useTheme();

  const plus = (
    <StepButton
      symbol="+"
      onPress={onIncrement}
      disabled={!canIncrement}
      accessibilityLabel={addLabel}
      filled
    />
  );

  if (quantity === 0) return plus;

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundSelected }]}>
      <StepButton
        symbol="−"
        onPress={onDecrement}
        disabled={!canDecrement}
        accessibilityLabel={removeLabel}
      />
      <ThemedText type="smallBold" style={styles.count} accessibilityLabel={quantityLabel}>
        {quantity}
      </ThemedText>
      {plus}
    </View>
  );
}

type StepButtonProps = {
  symbol: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  filled?: boolean;
};

function StepButton({ symbol, onPress, accessibilityLabel, disabled, filled }: StepButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      role="button"
      aria-label={accessibilityLabel}
      aria-disabled={disabled}
      hitSlop={Spacing.two}
      style={({ pressed }) => [
        styles.button,
        filled && { backgroundColor: theme.primary },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <ThemedText style={[styles.symbol, { color: filled ? theme.onPrimary : theme.text }]}>
        {symbol}
      </ThemedText>
    </Pressable>
  );
}

const BUTTON_SIZE = 32;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  count: {
    minWidth: Spacing.four,
    textAlign: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 20,
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
