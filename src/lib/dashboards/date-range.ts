import type { DatePreset } from './types';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function resolveDatePreset(preset: DatePreset): { fromDate?: string; toDate?: string } {
  if (preset === 'all') return {};
  const now = new Date();
  const end = isoDate(now);
  if (preset === 'today') return { fromDate: end, toDate: end };
  if (preset === '7d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { fromDate: isoDate(start), toDate: end };
  }
  if (preset === '30d') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { fromDate: isoDate(start), toDate: end };
  }
  if (preset === 'month') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return { fromDate: isoDate(start), toDate: end };
  }
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  return { fromDate: isoDate(start), toDate: end };
}

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
  { value: 'ytd', label: 'Year to date' },
];
