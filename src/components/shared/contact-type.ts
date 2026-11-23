export type ContactTypeFilter = 'customers' | 'vendors';

export function readContactType(value?: string | null): ContactTypeFilter {
  if (value === 'vendors' || value === 'vendor') return 'vendors';
  return 'customers';
}
