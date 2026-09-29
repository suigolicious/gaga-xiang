import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Fixed text shown before the input, e.g. "+1". */
  prefix?: string;
};

/**
 * A labeled text input in the app's colors. React Native's TextInput has no default
 * styling or dark-mode colors, unlike a web <input>, so every field goes through here.
 */
export function TextField({ label, prefix, style, ...inputProps }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={[styles.box, { backgroundColor: theme.backgroundElement }]}>
        {prefix && <ThemedText style={styles.prefix}>{prefix}</ThemedText>}
        <TextInput
          aria-label={label}
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.tint}
          style={[styles.input, { color: theme.text }, style]}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
  },
  prefix: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 18,
  },
});
