import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function PackingScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      title={t('admin.packing.title')}
      description={t('admin.packing.description')}
    />
  );
}
