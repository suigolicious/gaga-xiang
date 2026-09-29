/**
 * Business rules from the project spec (.claude/CLAUDE.md). The app uses these
 * to show the right state, but the server must enforce them too — the UI alone
 * can be bypassed.
 */

/** All ordering and delivery dates are in New York time, all year (EST/EDT). */
export const BusinessTimeZone = 'America/New_York';

/** Orders for a delivery day close at this hour (24h, New York time) the day before. */
export const OrderCutoffHour = 14;

/** The kitchen can make at most this many lunchboxes per delivery day, across all locations. */
export const DailyLunchboxCap = 100;

/** Every lunchbox costs the same, every day. In US cents, to avoid floating-point rounding. */
export const LunchboxPriceCents = 1200;

/**
 * Sales tax on orders, in basis points (700 = 7.00%): North Carolina 4.75% plus
 * Forsyth County 2.25%, for delivery from Clemmons, NC. Prepared food is taxed at
 * the full rate. Source: NCDOR current sales and use tax rates (checked 2026-09-28).
 * Doesn't include any local prepared-meals tax; confirm none applies.
 */
export const SalesTaxBasisPoints = 700;
