/**
 * US phone numbers only: customers are in North Carolina, and texts go through a US
 * number. Numbers are stored and sent to Supabase in E.164 form ("+13365550100").
 */

/** "+13365550100" from "(336) 555-0100", "336.555.0100", "1 336 555 0100", etc.; null if invalid. */
export function toUsE164(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  // US area codes and exchanges never start with 0 or 1.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  return `+1${digits}`;
}

/** "(336) 555-0100" from "+13365550100" or Supabase's "13365550100". */
export function formatUsPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
