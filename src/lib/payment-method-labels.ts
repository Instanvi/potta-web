import { PAYMENT_METHODS } from '@/app/(routes)/pos/utils/sale';

const FALLBACK_LABELS: Record<string, string> = {
  ...Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label])),
  ACCOUNT_CREDIT: 'Account credit',
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  card: 'Card',
  cheque: 'Cheque',
  other: 'Other',
};

/** Human label for an org payment-method code (or legacy enum). */
export function paymentMethodDisplayLabel(
  code?: string | null,
  orgMethods?: { code: string; name: string }[] | null,
): string {
  if (!code) return '—';
  const fromOrg = orgMethods?.find((m) => m.code === code)?.name;
  if (fromOrg) return fromOrg;
  return FALLBACK_LABELS[code] ?? FALLBACK_LABELS[code.toUpperCase()] ?? code;
}
