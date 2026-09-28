import 'i18next';

import type { resources } from './index';

// Type-checks translation keys: t('menu.title') compiles, t('menu.titel') does not.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}
