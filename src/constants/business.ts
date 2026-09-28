/**
 * Business rules from the project spec (.claude/CLAUDE.md). The app uses these
 * to show the right state, but the server must enforce them too — the UI alone
 * can be bypassed.
 */

/** All ordering and delivery dates are in New York time, all year (EST/EDT). */
export const BusinessTimeZone = 'America/New_York';

/** Orders for a delivery day close at this hour (24h, New York time) the day before. */
export const OrderCutoffHour = 14;

/** The kitchen can make at most this many dishes per delivery day. */
export const DailyDishCap = 100;
