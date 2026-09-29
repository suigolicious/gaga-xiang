import { useTranslation } from 'react-i18next';

import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function PrepSheetScreen() {
  const { t } = useTranslation();
  return (
    <PlaceholderScreen
      title={t('admin.prepSheet.title')}
      description={t('admin.prepSheet.description')}
    />
  );
}
