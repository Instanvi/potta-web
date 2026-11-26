/**
 * Helpers for create/update payloads.
 * Notes are optional and have no minimum length. Empty values are omitted.
 * Payment terms on invoices and purchase orders still require 10 characters
 * when sent, so short labels such as "Net 30" are expanded before send.
 */

const PAYMENT_TERMS_MIN = 10;

/** Keep a trimmed string. Empty values are omitted. */
export function apiOptionalText(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return undefined;
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

  const mapped = map[raw] ?? raw;
  if (mapped.length < PAYMENT_TERMS_MIN) return undefined;
  return mapped;
}

/** Optional address / free-text. Empty values are omitted. */
export function apiOptionalAddress(value: unknown): string | undefined {
  return apiOptionalText(value);
}

const OPTIONAL_TEXT_KEYS = new Set([
  'notes',
  'note',
  'message',
  'billingAddress',
  'shippingAddress',
]);

const TERMS_KEYS = new Set(['paymentTerms']);

/**
 * Final pass for create/update bodies: drop empty/short optional text and
 * normalize payment terms. Safe to run on any plain object payload.
 */
export function sanitizeDocumentPayload<T extends Record<string, unknown>>(
  payload: T,
): T {
  const next: Record<string, unknown> = { ...payload };
  for (const key of Object.keys(next)) {
    if (TERMS_KEYS.has(key)) {
      const terms = apiPaymentTerms(next[key]);
      if (terms) next[key] = terms;
      else delete next[key];
      continue;
    }
    if (OPTIONAL_TEXT_KEYS.has(key)) {
      const text = apiOptionalText(next[key]);
      if (text) next[key] = text;
      else delete next[key];
    }
  }
  return next as T;
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

  return sanitizeDocumentPayload(next as T);
}
