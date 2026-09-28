import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function OrdersScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('orders.title')} description={t('orders.description')} />;
}
