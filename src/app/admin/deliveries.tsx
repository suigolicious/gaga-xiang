import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function DeliveriesScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      title={t('admin.deliveries.title')}
      description={t('admin.deliveries.description')}
    />
  );
}
