import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-provider';
import { LanguagePicker } from '@/components/language-picker';
import { SignOutButton } from '@/components/sign-out-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, TopTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatUsPhone } from '@/lib/phone';

export default function AccountScreen() {
  const { t } = useTranslation();
  const { ready, session, profile, isAdmin } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('account.title')}</ThemedText>

          {/* Nothing sign-in related until the saved sign-in has been checked, so a
              signed-in customer never sees a flash of the "Sign in" button. */}
          {ready && !session && (
            <View style={styles.section}>
              <ThemedText themeColor="textSecondary">{t('account.signedOutIntro')}</ThemedText>
              <Link href="/sign-in" asChild>
                <PrimaryButton label={t('account.signIn')} />
              </Link>
            </View>
          )}

          {session && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <Detail label={t('account.nameLabel')} value={profile?.fullName ?? '—'} />
              <Detail
                label={t('account.phoneLabel')}
                value={session.user.phone ? formatUsPhone(session.user.phone) : '—'}
              />
            </ThemedView>
          )}

          {isAdmin && (
            <Link href="/admin" asChild>
              <AdminRow />
            </Link>
          )}

          <LanguagePicker />

          {/* Kept apart from the admin row, with the language picker in between, so
              it isn't tapped by accident. */}
          {session && (
            <View style={styles.signOut}>
              <SignOutButton />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

/** Opens the admin screens. Forwards Link's press handler (`asChild`) to the Pressable. */
function AdminRow(pressableProps: { onPress?: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable role="button" {...pressableProps} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type="backgroundElement"
        style={[styles.adminRow, { borderLeftColor: theme.primary }]}>
        <View style={styles.detail}>
          <ThemedText type="smallBold">{t('account.adminTitle')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('account.adminSummary')}
          </ThemedText>
        </View>
        <ThemedText type="subtitle" themeColor="tint">
          →
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

/** Forwards Link's press handler (`asChild`) to the Pressable. */
function PrimaryButton({ label, ...pressableProps }: { label: string; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      role="button"
      {...pressableProps}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingTop: TopTabInset + Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.three,
  },
  detail: {
    gap: Spacing.half,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderLeftWidth: 4,
  },
  signOut: {
    marginTop: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
