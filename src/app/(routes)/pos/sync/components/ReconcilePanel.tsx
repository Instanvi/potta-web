'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { DateRangePicker } from '@potta/components/ui/date-picker';
import { formatAmount, startOfMonth, today } from '../../../_shared/format';
import { ErrorState, LoadingState, StatCard } from '../../../_shared/states';
import { useReconcile } from '../hooks';

const n = (v: unknown) => Number(v ?? 0) || 0;

type CompareRow = { label: string; pos: number; gl: number };

const compareColumns: ColumnDef<CompareRow>[] = [
  { accessorKey: 'label', header: 'Check', enableSorting: false },
  {
    accessorKey: 'pos',
    header: 'POS (synced)',
    enableSorting: false,
    cell: ({ row }) => <span className="tabular-nums">{formatAmount(row.original.pos)}</span>,
  },
  {
    accessorKey: 'gl',
    header: 'General ledger',
    enableSorting: false,
    cell: ({ row }) => <span className="tabular-nums">{formatAmount(row.original.gl)}</span>,
  },
  {
    id: 'difference',
    header: 'Difference',
    cell: ({ row }) => {
      const diff = row.original.pos - row.original.gl;
      const ok = Math.abs(diff) < 0.01;
      return (
        <span className={`font-medium tabular-nums ${ok ? 'text-success' : 'text-destructive'}`}>
          {ok ? 'Matched' : formatAmount(diff)}
        </span>
      );
    },
  },
];

const ReconcilePanel = () => {
  const [range, setRange] = useState<{ from?: string; to?: string }>({
    from: startOfMonth(),
    to: today(),
  });
  const from = range.from ?? '';
  const to = range.to ?? '';
  const invalid = !!from && !!to && from > to;
  const { data, isLoading, error, refetch } = useReconcile(from, to);

  const txn = data?.transactionsCollect ?? {};
  const gl = data?.generalLedger ?? {};

  return (
    <div>
      <div className="mb-4">
        <DateRangePicker label="Period" className="w-72" value={range} onChange={setRange} />
      </div>
      {invalid ? (
        <p className="text-sm text-destructive">The start date must be before the end date.</p>
      ) : !from || !to ? (
        <p className="text-sm text-muted-foreground">Pick a period to reconcile.</p>
      ) : isLoading ? (
        <LoadingState label="Reconciling..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard label="Mapped sales (all time)" value={data.mappings.sales} />
            <StatCard label="Mapped expenses (all time)" value={data.mappings.expenses} />
            <StatCard label="Mapped reversals (all time)" value={data.mappings.reversals} />
            <StatCard label="POS sales in range" value={n(txn.pos_sales_count)} />
            <StatCard label="POS expenses in range" value={n(txn.pos_expenses_count)} />
          </div>
          <DataTable
            className="max-w-3xl"
            columns={compareColumns}
            data={[
              {
                label: 'Sales vs revenue (701 credit)',
                pos: n(txn.pos_sales_total),
                gl: n(gl.revenue_credit_701),
              },
              {
                label: 'Expenses vs expense (629 debit)',
                pos: n(txn.pos_expenses_total),
                gl: n(gl.expense_debit_629),
              },
            ]}
            withRowSelection={false}
            showPagination={false}
          />
          <div className="grid max-w-3xl grid-cols-3 gap-3">
            <StatCard label="Cash 571 debits" value={formatAmount(gl.cash_debit_571)} />
            <StatCard label="Cash 571 credits" value={formatAmount(gl.cash_credit_571)} />
            <StatCard
              label="Cash 571 net movement"
              value={formatAmount(n(gl.cash_debit_571) - n(gl.cash_credit_571))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReconcilePanel;
