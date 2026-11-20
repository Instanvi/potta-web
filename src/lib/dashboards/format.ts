import type { NumberFormat } from './types';

export const DEFAULT_FORMAT: NumberFormat = {
  decimals: 'auto',
  scale: 'none',
  currency: null,
};

export const MONEY_FORMAT: NumberFormat = {
  decimals: 0,
  scale: 'none',
  currency: 'XAF',
};

export function formatMetricValue(raw: string | number | null | undefined, format?: NumberFormat): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return '—';
  const f = format ?? DEFAULT_FORMAT;
  let value = n;
  let suffix = '';
  if (f.scale === 'K') {
    value = n / 1_000;
    suffix = 'K';
  } else if (f.scale === 'M') {
    value = n / 1_000_000;
    suffix = 'M';
  } else if (f.scale === 'B') {
    value = n / 1_000_000_000;
    suffix = 'B';
  }
  const decimals = f.decimals === 'auto' ? (Math.abs(value) >= 100 ? 0 : 2) : f.decimals;
  const body = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (f.currency) return `${body}${suffix} ${f.currency}`;
  return `${body}${suffix}`;
}
