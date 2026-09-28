import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LanguagePicker } from '@/components/language-picker';
import { PlaceholderScreen } from '@/components/placeholder-screen';
import { ThemedText } from '@/components/themed-text';

export default function AccountScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen title={t('account.title')} description={t('account.description')}>
      <LanguagePicker />
      {/* Admin is reachable in development until role-based sign-in exists. */}
      {__DEV__ && (
        <Link href="/admin">
          <ThemedText type="linkPrimary">{t('account.openAdmin')}</ThemedText>
        </Link>
      )}
    </PlaceholderScreen>
  );
}
