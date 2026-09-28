import type { Language } from '@/i18n';
import type { CalendarDate } from '@/lib/ordering-window';

const IntlLocales: Record<Language, string> = {
  en: 'en-US',
  'zh-Hans': 'zh-CN',
};

export function formatPrice(cents: number, language: Language) {
  return new Intl.NumberFormat(IntlLocales[language], {
    style: 'currency',
    currency: 'USD',
    // Customers are all in the US, so show "$16.00" rather than "US$16.00" in Chinese.
    currencyDisplay: 'narrowSymbol',
  }).format(cents / 100);
}

/** e.g. "Tuesday, September 29" or "9月29日星期二". */
export function formatCalendarDate({ year, month, day }: CalendarDate, language: Language) {
  // Format in UTC so the date doesn't shift with the device's time zone.
  return new Intl.DateTimeFormat(IntlLocales[language], {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
