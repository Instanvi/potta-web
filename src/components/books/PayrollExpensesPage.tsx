'use client';

import { useCallback, useEffect, useState } from 'react';
import RootLayout from '@/app/(routes)/layout';
import { EmptyState, ErrorState, ListToolbar, PageContainer, PageHeader, Panel } from '@/app/(routes)/_shared/states';
import { Button } from '@/components/shadcn/button';
import { FIELD_INPUT } from '@/lib/field-styles';
import { extractBooksRows, cellValue, rowId } from '@/lib/books-api';
import { payrollClient } from 'config/axios.config';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'merchant', label: 'Merchant' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
  { key: 'category', label: 'Category' },
];

function normalizeTx(row: Record<string, unknown>): Record<string, unknown> {
  return {
    ...row,
    date: row.date ?? row.transaction_date ?? row.transactionDate ?? row.created_at ?? row.createdAt,
    merchant: row.merchant ?? row.merchant_name ?? row.vendor_name ?? row.description,
    category: row.category ?? row.category_name ?? row.expense_category,
  };
}

export function PayrollExpensesPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await payrollClient.get('/expense/transactions', {
        params: { page: 1, limit: 50, search: search.trim() || undefined },
      });
      const list = extractBooksRows(res.data?.data ?? res.data).length
        ? extractBooksRows(res.data?.data ?? res.data)
        : extractBooksRows(res.data);
      setRows(list.map(normalizeTx));
    } catch (e) {
      setError(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Expenses"
          actions={
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
          }
        />
        <ListToolbar>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            placeholder="Search expenses…"
            className={cn(FIELD_INPUT, 'max-w-sm')}
          />
        </ListToolbar>

        <div className="mt-4">
          {error ? (
            <ErrorState error={error} onRetry={() => void load()} />
          ) : loading ? (
            <Panel className="px-6 py-16 text-center text-sm text-muted-foreground">Loading…</Panel>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No expense transactions"
              description="Payroll expense API returned no rows, or the service is unreachable."
            />
          ) : (
            <Panel className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    {COLUMNS.map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium text-muted-foreground">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={rowId(row)} className="border-b border-black/10">
                      {COLUMNS.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          {cellValue(row, c.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}
        </div>
      </PageContainer>
    </RootLayout>
  );
}
