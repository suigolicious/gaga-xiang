import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function AdminOrdersScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      title={t('admin.orders.title')}
      description={t('admin.orders.description')}
    />
  );
}
