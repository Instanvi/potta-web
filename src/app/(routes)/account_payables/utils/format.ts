const formatters = new Map<string, Intl.NumberFormat>();

/** Currency amount; XAF has no minor unit so it is shown without decimals. */
export const formatMoney = (value: unknown, currency: string | null | undefined = 'XAF') => {
  const code = (currency || 'XAF').toUpperCase();
  let formatter = formatters.get(code);
  if (!formatter) {
    const zeroDecimals = code === 'XAF' || code === 'XOF';
    try {
      formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: zeroDecimals ? 0 : 2,
        maximumFractionDigits: zeroDecimals ? 0 : 2,
      });
    } catch {
      formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
    }
    formatters.set(code, formatter);
  }
  const n = Number(value ?? 0);
  return formatter.format(Number.isFinite(n) ? n : 0);
};

/** Short axis label, e.g. 1.2M / 350k. */
export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
