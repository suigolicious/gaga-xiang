import { BusinessTimeZone, OrderCutoffHour } from '@/constants/business';

/** A calendar date with no time or time zone, e.g. a delivery day. */
export type CalendarDate = { year: number; month: number; day: number };

export type OrderingWindow = {
  /** The only day customers can order for: tomorrow in New York. */
  deliveryDate: CalendarDate;
  /** False after the cutoff; ordering reopens at midnight New York time. */
  isOpen: boolean;
};

/** The calendar date `days` after `date`. */
export function addDays({ year, month, day }: CalendarDate, days: number): CalendarDate {
  // Date.UTC rolls month and year over, so the result is always a valid date.
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

const newYorkParts = new Intl.DateTimeFormat('en-US', {
  timeZone: BusinessTimeZone,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  hourCycle: 'h23',
});

/**
 * Customers can only order for the next day, before the cutoff on the day before.
 * After the cutoff, ordering is closed until midnight rather than moving on to the
 * day after tomorrow.
 */
export function getOrderingWindow(now: Date): OrderingWindow {
  const parts = Object.fromEntries(
    newYorkParts.formatToParts(now).map((part) => [part.type, Number(part.value)]),
  );
  return {
    deliveryDate: addDays({ year: parts.year, month: parts.month, day: parts.day }, 1),
    isOpen: parts.hour < OrderCutoffHour,
  };
}
