'use client';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { DateRangePicker } from '@potta/components/ui/date-picker';
import { formatAmount, startOfMonth, today } from '../../../_shared/format';
import { ErrorState, LoadingState, StatCard } from '../../../_shared/states';
import { useReconcile } from '../hooks';

const n = (v: unknown) => Number(v ?? 0) || 0;

type CompareRow = {
  label: string;
  hint: string;
  pos: number;
  gl: number;
};

function diffMessage(pos: number, gl: number): { ok: boolean; text: string } {
  const diff = pos - gl;
  if (Math.abs(diff) < 0.01) return { ok: true, text: 'Match' };
  if (diff < 0) return { ok: false, text: `Books higher by ${formatAmount(-diff)}` };
  return { ok: false, text: `Till higher by ${formatAmount(diff)}` };
}

const compareColumns: ColumnDef<CompareRow>[] = [
  {
    accessorKey: 'label',
    header: 'What we compare',
    enableSorting: false,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.label}</p>
        <p className="text-xs text-muted-foreground">{row.original.hint}</p>
      </div>
    ),
  },
  {
    accessorKey: 'pos',
    header: 'From the till',
    enableSorting: false,
    cell: ({ row }) => <span className="tabular-nums">{formatAmount(row.original.pos)}</span>,
  },
  {
    accessorKey: 'gl',
    header: 'In the books',
    enableSorting: false,
    cell: ({ row }) => <span className="tabular-nums">{formatAmount(row.original.gl)}</span>,
  },
  {
    id: 'difference',
    header: 'Result',
    cell: ({ row }) => {
      const { ok, text } = diffMessage(row.original.pos, row.original.gl);
      return (
        <span className={`font-medium tabular-nums ${ok ? 'text-success' : 'text-destructive'}`}>
          {text}
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

  const salesPos = n(txn.pos_sales_total);
  const salesGl = n(gl.revenue_credit_701);
  const expensesPos = n(txn.pos_expenses_total);
  const expensesGl = n(gl.expense_debit_629);
  const sales = diffMessage(salesPos, salesGl);
  const expenses = diffMessage(expensesPos, expensesGl);
  const mappedSales = n(data?.mappings.sales);
  const allMatch = sales.ok && expenses.ok;
  const noTillData =
    mappedSales === 0 && n(txn.pos_sales_count) === 0 && n(txn.pos_expenses_count) === 0;

  return (
    <div>
      <div className="mb-4 max-w-3xl space-y-2">
        <p className="text-sm text-muted-foreground">
          Pick dates, then we check: did money from the shop till match what is in the books?
        </p>
        <DateRangePicker label="Dates" className="w-72" value={range} onChange={setRange} />
      </div>
      {invalid ? (
        <p className="text-sm text-destructive">The start date must be before the end date.</p>
      ) : !from || !to ? (
        <p className="text-sm text-muted-foreground">Pick dates to run the check.</p>
      ) : isLoading ? (
        <LoadingState label="Checking…" />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-6">
          <div
            className={`max-w-3xl rounded-[2px] border px-4 py-3 text-sm ${
              allMatch
                ? 'border-success/40 bg-success/5 text-success'
                : 'border-destructive/40 bg-destructive/5 text-destructive'
            }`}
          >
            {allMatch ? (
              <p className="font-medium">Everything matches for these dates.</p>
            ) : noTillData ? (
              <div className="space-y-1">
                <p className="font-medium">No till sales are linked yet.</p>
                <p className="text-foreground/80">
                  The books may still show sales, but nothing from the POS till has been synced for
                  this check. Open the Mappings tab, or sync the desktop till first.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-medium">Till and books do not match.</p>
                <p className="text-foreground/80">
                  Sales: {sales.text}. Expenses: {expenses.text}.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard
              label="Till sales linked (ever)"
              value={mappedSales}
              hint="How many POS sales Potta knows about"
            />
            <StatCard
              label="Till expenses linked (ever)"
              value={data.mappings.expenses}
              hint="How many POS expenses Potta knows about"
            />
            <StatCard
              label="Till refunds linked (ever)"
              value={data.mappings.reversals}
              hint="Refunds / reversals from the till"
            />
            <StatCard
              label="Till sales in these dates"
              value={n(txn.pos_sales_count)}
              hint="Count of synced sales in the period"
            />
            <StatCard
              label="Till expenses in these dates"
              value={n(txn.pos_expenses_count)}
              hint="Count of synced expenses in the period"
            />
          </div>

          <div className="max-w-3xl space-y-2">
            <h3 className="text-sm font-medium text-foreground">Money check</h3>
            <DataTable
              columns={compareColumns}
              data={[
                {
                  label: 'Sales',
                  hint: 'Till sales vs books revenue (account 701)',
                  pos: salesPos,
                  gl: salesGl,
                },
                {
                  label: 'Expenses',
                  hint: 'Till expenses vs books expense (account 629)',
                  pos: expensesPos,
                  gl: expensesGl,
                },
              ]}
              showPagination={false}
              storageKey="pos-sync-reconcile-table"
            />
          </div>

          <div className="max-w-3xl space-y-2">
            <h3 className="text-sm font-medium text-foreground">Cash in the books (account 571)</h3>
            <p className="text-xs text-muted-foreground">
              Money in and out of the cash account for these dates — from the books only.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Cash in" value={formatAmount(gl.cash_debit_571)} />
              <StatCard label="Cash out" value={formatAmount(gl.cash_credit_571)} />
              <StatCard
                label="Net cash change"
                value={formatAmount(n(gl.cash_debit_571) - n(gl.cash_credit_571))}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReconcilePanel;
