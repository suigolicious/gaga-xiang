import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** An outlined, full-width "Sign out" button. */
export function SignOutButton() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { signOut } = useAuth();

  return (
    <Pressable
      onPress={signOut}
      role="button"
      style={({ pressed }) => [
        styles.button,
        { borderColor: theme.border },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" themeColor="tint">
        {t('account.signOut')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
