import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function MenuScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t('menu.title')} description={t('menu.description')} />;
}
