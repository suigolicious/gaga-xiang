import { BusinessTimeZone, OrderCutoffHour } from '@/constants/business';

/** A calendar date with no time or time zone, e.g. a delivery day. */
export type CalendarDate = { year: number; month: number; day: number };

export type OrderingWindow = {
  /** The only day customers can order for: tomorrow in New York. */
  deliveryDate: CalendarDate;
  /** False after the cutoff; ordering reopens at midnight New York time. */
  isOpen: boolean;
};

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
  // Date.UTC rolls month and year over, so day + 1 is always a valid date.
  const tomorrow = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));

  return {
    deliveryDate: {
      year: tomorrow.getUTCFullYear(),
      month: tomorrow.getUTCMonth() + 1,
      day: tomorrow.getUTCDate(),
    },
    isOpen: parts.hour < OrderCutoffHour,
  };
}

/** A stable key for a calendar date, e.g. "2026-09-29". */
export function toDateKey({ year, month, day }: CalendarDate) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
