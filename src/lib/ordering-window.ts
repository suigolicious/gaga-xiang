/** A calendar date with no time or time zone, e.g. a delivery day. */
export type CalendarDate = { year: number; month: number; day: number };

export type OrderingWindow = {
  /** Tomorrow in the business's time zone: the only day customers can order for. */
  deliveryDate: CalendarDate;
  /** False after the cutoff; ordering reopens at midnight. */
  isOpen: boolean;
  /**
   * The delivery an order set up now is for: tomorrow while ordering is open, and the
   * day after once it's closed (checkout reopens at midnight for that day).
   */
  orderDate: CalendarDate;
};

type OrderingRules = {
  /** IANA time zone the cutoff and dates are in, e.g. "America/New_York". */
  timeZone: string;
  /** Orders for a day close at this hour (0-23) the day before. */
  cutoffHour: number;
};

/** The calendar date `days` after `date`. */
export function addDays({ year, month, day }: CalendarDate, days: number): CalendarDate {
  // Date.UTC rolls month and year over, so the result is always a valid date.
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** "2026-09-30", the form Postgres `date` columns use. */
export function toIsoDate({ year, month, day }: CalendarDate) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Date and hour parts of `now` in `timeZone`. Formatters are cached: they're slow to create. */
function partsIn(now: Date, timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23',
    });
    formatters.set(timeZone, formatter);
  }
  return Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, Number(part.value)]),
  );
}

/**
 * Customers can only order for the next day, before the cutoff on the day before.
 * After the cutoff, ordering is closed until midnight rather than moving on to the
 * day after tomorrow.
 */
export function getOrderingWindow(now: Date, { timeZone, cutoffHour }: OrderingRules): OrderingWindow {
  const parts = partsIn(now, timeZone);
  const deliveryDate = addDays({ year: parts.year, month: parts.month, day: parts.day }, 1);
  const isOpen = parts.hour < cutoffHour;
  return { deliveryDate, isOpen, orderDate: isOpen ? deliveryDate : addDays(deliveryDate, 1) };
}
