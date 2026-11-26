/**
 * Backend document DTOs often mark optional strings with `@IsNotEmpty()` +
 * `@MinLength(10)`. Empty strings and short UI defaults (e.g. "Net 30") then
 * return 400. Use these helpers when building create/update payloads.
 */

const DEFAULT_MIN = 10;

/** Keep a string only when it meets the API minimum length. */
export function apiOptionalText(
  value: unknown,
  minLength = DEFAULT_MIN,
): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.length < minLength) return undefined;
  return text;
}

/**
 * Map short payment-term labels to API-safe values (≥10 chars).
 * Returns undefined when there is nothing useful to send.
 */
export function apiPaymentTerms(value: unknown): string | undefined {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return undefined;

  const map: Record<string, string> = {
    'Net 15': 'Net 15 days',
    'Net 30': 'Net 30 days',
    'Net 60': 'Net 60 days',
    'Net 15 days': 'Net 15 days',
    'Net 30 days': 'Net 30 days',
    'Net 60 days': 'Net 60 days',
    'Due on receipt': 'Due on receipt',
  };

  return apiOptionalText(map[raw] ?? raw);
}

/** Optional address / free-text fields that share the same MinLength rule. */
export function apiOptionalAddress(value: unknown): string | undefined {
  return apiOptionalText(value);
}

/** Drop empty or short optional keys from a payload object. */
export function withOptionalDocumentFields<T extends Record<string, unknown>>(
  payload: T,
  fields: {
    notes?: unknown;
    note?: unknown;
    paymentTerms?: unknown;
    billingAddress?: unknown;
    shippingAddress?: unknown;
  },
): T {
  const next: Record<string, unknown> = { ...payload };

  if ('notes' in fields) {
    const notes = apiOptionalText(fields.notes);
    if (notes) next.notes = notes;
    else delete next.notes;
  }
  if ('note' in fields) {
    const note = apiOptionalText(fields.note);
    if (note) next.note = note;
    else delete next.note;
  }
  if ('paymentTerms' in fields) {
    const paymentTerms = apiPaymentTerms(fields.paymentTerms);
    if (paymentTerms) next.paymentTerms = paymentTerms;
    else delete next.paymentTerms;
  }
  if ('billingAddress' in fields) {
    const billingAddress = apiOptionalAddress(fields.billingAddress);
    if (billingAddress) next.billingAddress = billingAddress;
    else delete next.billingAddress;
  }
  if ('shippingAddress' in fields) {
    const shippingAddress = apiOptionalAddress(fields.shippingAddress);
    if (shippingAddress) next.shippingAddress = shippingAddress;
    else delete next.shippingAddress;
  }

  return next as T;
}
