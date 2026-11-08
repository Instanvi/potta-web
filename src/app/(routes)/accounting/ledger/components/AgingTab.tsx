'use client';
import { useMemo, useState } from 'react';
import Input from '@potta/components/input';
import { formatAmount, today } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState } from '../../../_shared/states';
import { useAgingReport } from '../hooks';
import { AgingRow, SubLedgerKind } from '../utils/api';
import SubLedgerSheet from './SubLedgerSheet';

const BUCKETS: { key: keyof AgingRow['aging']; label: string }[] = [
  { key: 'current', label: 'Current' },
  { key: 'days30', label: '1–30 days' },
  { key: 'days60', label: '31–60 days' },
  { key: 'days90', label: '61–90 days' },
  { key: 'over90', label: '90+ days' },
];

const AgingTab = ({ type }: { type: SubLedgerKind }) => {
  const [asOfDate, setAsOfDate] = useState(today());
  const [selected, setSelected] = useState<AgingRow | null>(null);
  const { data, isLoading, error, refetch } = useAgingReport(type, asOfDate);
  const rows = data ?? [];

  const totals = useMemo(() => {
    const t = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, balance: 0 };
    rows.forEach((r) => {
      BUCKETS.forEach((b) => (t[b.key] += Number(r.aging?.[b.key] ?? 0)));
      t.balance += Number(r.currentBalance ?? 0);
    });
    return t;
  }, [rows]);

  const partyLabel = type === 'AR' ? 'Customer' : 'Vendor';

  return (
    <div>
      <div className="w-44 mb-4">
        <Input
          type="date"
          name="asOfDate"
          label="As of"
          value={asOfDate}
          onchange={(e) => setAsOfDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${type === 'AR' ? 'receivables' : 'payables'}`}
          description={`${partyLabel} balances appear here once invoices or purchases are posted.`}
        />
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-50 text-left">
                <th className="px-4 py-3 font-medium">{partyLabel}</th>
                {BUCKETS.map((b) => (
                  <th key={b.key} className="px-4 py-3 font-medium text-right">
                    {b.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.referenceId}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-4 py-3 font-medium">{r.referenceName || r.referenceId}</td>
                  {BUCKETS.map((b) => (
                    <td key={b.key} className="px-4 py-3 text-right">
                      {formatAmount(r.aging?.[b.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-medium">
                    {formatAmount(r.currentBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 font-medium">
                <td className="px-4 py-3">Total</td>
                {BUCKETS.map((b) => (
                  <td key={b.key} className="px-4 py-3 text-right">
                    {formatAmount(totals[b.key])}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">{formatAmount(totals.balance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <SubLedgerSheet type={type} row={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AgingTab;
