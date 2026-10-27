import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  /** Shown inside the empty field, and read out by screen readers. */
  placeholder: string;
  clearLabel: string;
};

/**
 * A search box: outlined pill with a magnifying glass, unlike the filled cards it
 * filters, and a clear button once there's text.
 */
export function SearchField({ value, onChangeText, placeholder, clearLabel }: SearchFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: theme.background, borderColor: focused ? theme.tint : theme.border },
      ]}>
      <MagnifyingGlass color={theme.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        aria-label={placeholder}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.tint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
        // Phones show "Search" on the return key.
        enterKeyHint="search"
        style={[styles.input, { color: theme.text }]}
      />
      {value !== '' && (
        <Pressable
          onPress={() => onChangeText('')}
          role="button"
          aria-label={clearLabel}
          hitSlop={Spacing.two}
          style={({ pressed }) => [
            styles.clear,
            { backgroundColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.clearSymbol}>
            ✕
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

/** Drawn with views rather than a character, which not every font has. */
function MagnifyingGlass({ color }: { color: string }) {
  return (
    <View style={styles.icon} aria-hidden>
      <View style={[styles.lens, { borderColor: color }]} />
      <View style={[styles.handle, { backgroundColor: color }]} />
    </View>
  );
}

const ICON_SIZE = 18;
const CLEAR_SIZE = 24;

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 16,
    // The box's border shows focus; the browser's own outline would double it on web.
    outlineWidth: 0,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  lens: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
  },
  handle: {
    position: 'absolute',
    width: 7,
    height: 2,
    borderRadius: 1,
    right: 0,
    bottom: 3,
    transform: [{ rotate: '45deg' }],
  },
  clear: {
    width: CLEAR_SIZE,
    height: CLEAR_SIZE,
    borderRadius: CLEAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSymbol: {
    fontSize: 12,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
