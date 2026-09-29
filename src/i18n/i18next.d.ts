import 'i18next';

import type { resources } from './index';

// Type-checks translation keys: t('lunchbox.title') compiles, t('lunchbox.titel') does not.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}
