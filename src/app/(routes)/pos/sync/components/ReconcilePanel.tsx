'use client';
import { useState } from 'react';
import Input from '@potta/components/input';
import { formatAmount, startOfMonth, today } from '../../../_shared/format';
import { ErrorState, LoadingState } from '../../../_shared/states';
import { useReconcile } from '../hooks';

const n = (v: unknown) => Number(v ?? 0) || 0;

const CompareRow = ({ label, pos, gl }: { label: string; pos: number; gl: number }) => {
  const diff = pos - gl;
  const ok = Math.abs(diff) < 0.01;
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3">{label}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatAmount(pos)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatAmount(gl)}</td>
      <td
        className={`px-4 py-3 text-right tabular-nums font-medium ${
          ok ? 'text-green-700' : 'text-red-600'
        }`}
      >
        {ok ? 'Matched' : formatAmount(diff)}
      </td>
    </tr>
  );
};

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border border-gray-200 p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-xl font-medium">{value}</p>
  </div>
);

const ReconcilePanel = () => {
  const [from, setFrom] = useState(startOfMonth());
  const [to, setTo] = useState(today());
  const invalid = !!from && !!to && from > to;
  const { data, isLoading, error, refetch } = useReconcile(from, to);

  const txn = data?.transactionsCollect ?? {};
  const gl = data?.generalLedger ?? {};

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-44">
          <Input type="date" name="from" label="From" value={from} onchange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-44">
          <Input type="date" name="to" label="To" value={to} onchange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      {invalid ? (
        <p className="text-sm text-red-600">The start date must be before the end date.</p>
      ) : isLoading ? (
        <LoadingState label="Reconciling..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Mapped sales (all time)" value={data.mappings.sales} />
            <Stat label="Mapped expenses (all time)" value={data.mappings.expenses} />
            <Stat label="Mapped reversals (all time)" value={data.mappings.reversals} />
            <Stat label="POS sales in range" value={n(txn.pos_sales_count)} />
            <Stat label="POS expenses in range" value={n(txn.pos_expenses_count)} />
          </div>
          <div className="border border-gray-200 max-w-3xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 text-left">
                  <th className="px-4 py-3 font-medium">Check</th>
                  <th className="px-4 py-3 font-medium text-right">POS (synced)</th>
                  <th className="px-4 py-3 font-medium text-right">General ledger</th>
                  <th className="px-4 py-3 font-medium text-right">Difference</th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Sales vs revenue (701 credit)"
                  pos={n(txn.pos_sales_total)}
                  gl={n(gl.revenue_credit_701)}
                />
                <CompareRow
                  label="Expenses vs expense (629 debit)"
                  pos={n(txn.pos_expenses_total)}
                  gl={n(gl.expense_debit_629)}
                />
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-3xl">
            <Stat label="Cash 571 debits" value={formatAmount(gl.cash_debit_571)} />
            <Stat label="Cash 571 credits" value={formatAmount(gl.cash_credit_571)} />
            <Stat
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
