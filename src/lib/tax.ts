import { SalesTaxBasisPoints } from '@/constants/business';

/** Sales tax on a subtotal, rounded to the nearest cent. The server computes the charged amount. */
export function salesTaxCents(subtotalCents: number) {
  return Math.round((subtotalCents * SalesTaxBasisPoints) / 10_000);
}

/** The tax rate as a percentage, e.g. 7 or 7.25. */
export const SalesTaxPercent = SalesTaxBasisPoints / 100;
