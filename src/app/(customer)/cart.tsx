import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function CartScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('cart.title')} description={t('cart.description')} />;
}
