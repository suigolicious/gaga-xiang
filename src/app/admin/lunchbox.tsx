import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function AdminMenuScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen title={t('admin.menu.title')} description={t('admin.menu.description')} />
  );
}
