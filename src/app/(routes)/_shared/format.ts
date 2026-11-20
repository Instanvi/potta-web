export const formatAmount = (value: unknown, currency?: string) => {
  const n = Number(value ?? 0);
  const formatted = (Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
};

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
};

/** YYYY-MM-DD in local time, for `<input type="date">` and API date params. */
export const toDateInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const startOfMonth = () => {
  const d = new Date();
  return toDateInput(new Date(d.getFullYear(), d.getMonth(), 1));
};

export const startOfYear = () => toDateInput(new Date(new Date().getFullYear(), 0, 1));

export const today = () => toDateInput(new Date());

export const apiErrorMessage = (error: unknown, fallback: string) => {
  const raw = (error as any)?.response?.data?.message;
  return Array.isArray(raw) ? raw.join(', ') : raw || fallback;
};
