'use client';
import { useMemo, useState } from 'react';
import Input from '@potta/components/input';
import { formatAmount, today } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState, StatCard } from '../../../_shared/states';
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
    <div className="flex flex-col gap-4">
      <div className="w-44">
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
        <>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total outstanding" value={formatAmount(totals.balance)} />
          <StatCard label="Current" value={formatAmount(totals.current)} />
          <StatCard
            label="Over 90 days"
            value={formatAmount(totals.over90)}
            tone={totals.over90 > 0 ? 'destructive' : 'default'}
          />
        </div>
        <div className="overflow-x-auto rounded-[2px] border border-black/[0.08] bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="h-12 border-b border-black/10 bg-table-head text-left">
                <th className="px-4 font-normal">{partyLabel}</th>
                {BUCKETS.map((b) => (
                  <th key={b.key} className="px-4 text-right font-normal">
                    {b.label}
                  </th>
                ))}
                <th className="px-4 text-right font-normal">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.referenceId}
                  className="cursor-pointer border-b border-black/[0.06] transition-colors hover:bg-black/[0.02]"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-4 py-3">{r.referenceName || r.referenceId}</td>
                  {BUCKETS.map((b) => (
                    <td key={b.key} className="px-4 py-3 text-right tabular-nums">
                      {formatAmount(r.aging?.[b.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatAmount(r.currentBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/10 bg-brand-subtle font-medium">
                <td className="px-4 py-3">Total</td>
                {BUCKETS.map((b) => (
                  <td key={b.key} className="px-4 py-3 text-right tabular-nums">
                    {formatAmount(totals[b.key])}
                  </td>
                ))}
                <td className="px-4 py-3 text-right tabular-nums">{formatAmount(totals.balance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        </>
      )}

      <SubLedgerSheet type={type} row={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AgingTab;
