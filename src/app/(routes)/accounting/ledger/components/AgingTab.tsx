'use client';
import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import { DatePicker } from '@potta/components/ui/date-picker';
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

const Amount = ({ value, strong }: { value: unknown; strong?: boolean }) => (
  <div className={`w-full text-right tabular-nums${strong ? ' font-medium' : ''}`}>{formatAmount(value)}</div>
);

const AgingTab = ({ type }: { type: SubLedgerKind }) => {
  const [asOfDate, setAsOfDate] = useState(today());
  const [selected, setSelected] = useState<AgingRow | null>(null);
  const { data, isLoading, error, refetch } = useAgingReport(type, asOfDate);
  const rows = useMemo(() => data ?? [], [data]);

  const totals = useMemo(() => {
    const t = { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, balance: 0 };
    rows.forEach((r) => {
      BUCKETS.forEach((b) => (t[b.key] += Number(r.aging?.[b.key] ?? 0)));
      t.balance += Number(r.currentBalance ?? 0);
    });
    return t;
  }, [rows]);

  const partyLabel = type === 'AR' ? 'Customer' : 'Vendor';

  const columns: ColumnDef<AgingRow>[] = [
    {
      id: 'party',
      header: partyLabel,
      accessorFn: (r) => r.referenceName || r.referenceId,
    },
    ...BUCKETS.map<ColumnDef<AgingRow>>((b) => ({
      id: b.key,
      header: () => <div className="w-full text-right">{b.label}</div>,
      accessorFn: (r) => Number(r.aging?.[b.key] ?? 0),
      cell: ({ row }) => <Amount value={row.original.aging?.[b.key]} />,
    })),
    {
      id: 'balance',
      header: () => <div className="w-full text-right">Balance</div>,
      accessorFn: (r) => Number(r.currentBalance ?? 0),
      cell: ({ row }) => <Amount value={row.original.currentBalance} strong />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        id="agingAsOf"
        label="As of"
        className="w-52"
        value={asOfDate}
        onChange={(value) => setAsOfDate(value || today())}
      />

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
          <DataTable
            columns={columns}
            data={rows}
            withRowSelection={false}
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100]}
            onRowClick={setSelected}
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-[2px] border border-black/[0.08] bg-brand-subtle px-4 py-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
            {BUCKETS.map((b) => (
              <div key={b.key} className="flex flex-col">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="font-medium tabular-nums">{formatAmount(totals[b.key])}</span>
              </div>
            ))}
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total balance</span>
              <span className="font-semibold tabular-nums">{formatAmount(totals.balance)}</span>
            </div>
          </div>
        </>
      )}

      <SubLedgerSheet type={type} row={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AgingTab;
