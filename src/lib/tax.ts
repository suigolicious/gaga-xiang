/**
 * Sales tax on a subtotal, rounded to the nearest cent. The rate is in basis points
 * (700 = 7.00%) and comes from the business settings. The server computes the
 * amount actually charged.
 */
export function salesTaxCents(subtotalCents: number, basisPoints: number) {
  return Math.round((subtotalCents * basisPoints) / 10_000);
}
