'use client';

import { useCallback, useEffect, useState } from 'react';
import RootLayout from '@/app/(routes)/layout';
import { ErrorState, ListToolbar, PageContainer, PageHeader } from '@/app/(routes)/_shared/states';
import { BooksListTable } from '@/components/books/books-list-table';
import { useDataTableHandle } from '@/components/ui/data-table';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Button } from '@/components/shadcn/button';
import { FIELD_INPUT } from '@/lib/field-styles';
import { extractBooksRows } from '@/lib/books-api';
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

function isNetworkError(error: unknown): boolean {
  const err = error as {
    code?: string;
    message?: string;
    response?: unknown;
  } | null;
  if (!err) return false;
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') return true;
  if (!err.response && typeof err.message === 'string') {
    const m = err.message.toLowerCase();
    return m.includes('network') || m.includes('failed to fetch');
  }
  return false;
}

export function PayrollExpensesPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const { table, onTableChange } = useDataTableHandle<Record<string, unknown>>();

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

  const displayError =
    error && isNetworkError(error)
      ? new Error(
          `Could not reach the payroll expense API. Restart potta-web after setting NEXT_PUBLIC_PAYROLL_API_URL (see .env.example), or confirm the spend/payroll service is up.`,
        )
      : error;

  return (
    <RootLayout>
      <PageContainer className="bg-white">
        <PageHeader
          title="Expenses"
          actions={
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => void load()}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
            >
              <i className={`ri-refresh-line text-base ${loading ? 'animate-spin' : ''}`} />
            </Button>
          }
        />
        <ListToolbar actions={table ? <DataTableViewOptions table={table} /> : null}>
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
          {displayError ? (
            <ErrorState error={displayError} onRetry={() => void load()} />
          ) : (
            <BooksListTable
              columns={COLUMNS}
              rows={rows}
              storageKey="payroll-expenses-table"
              isLoading={loading}
              emptyMessage="No expense transactions"
              onTableChange={onTableChange}
            />
          )}
        </div>
      </PageContainer>
    </RootLayout>
  );
}
