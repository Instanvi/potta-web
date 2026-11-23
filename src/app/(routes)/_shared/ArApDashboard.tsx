'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DateRangePicker } from '@potta/components/ui/date-picker';
import { useDashboardSummary } from '../account_payables/hooks';
import { DashboardSide } from '../account_payables/utils/types';
import { formatCompact, formatMoney } from '../account_payables/utils/format';
import { formatDate, startOfMonth, today } from './format';
import { EmptyState, ErrorState, Panel, StatCard, StatusBadge } from './states';
import { Skeleton } from '@potta/components/ui/loaders';
import { Button } from '@/components/shadcn/button';

const COPY: Record<DashboardSide, { party: string; docs: string; listHref: string; topTitle: string }> = {
  ar: { party: 'Customer', docs: 'invoices', listHref: '/account_receivables/invoice', topTitle: 'Top customers owing' },
  ap: { party: 'Vendor', docs: 'bills', listHref: '/account_payables/bills', topTitle: 'Top vendors owed' },
};

const AGING_LABELS = [
  { key: 'current', label: 'Current' },
  { key: 'days30', label: '1–30 days' },
  { key: 'days60', label: '31–60 days' },
  { key: 'days90', label: '61–90 days' },
  { key: 'over90', label: '90+ days' },
] as const;

const statusTone = (status: string) => {
  const s = status.toUpperCase();
  if (s === 'PAID') return 'success';
  if (s === 'OVERDUE' || s === 'REJECTED' || s === 'CANCELLED') return 'danger';
  if (s === 'DRAFT') return 'neutral';
  return 'warning';
};

/** Receivables / payables overview from GET /accounting/dashboard/{ar|ap}. */
const ArApDashboard = ({ side }: { side: DashboardSide }) => {
  const copy = COPY[side];
  const [range, setRange] = useState<{ from?: string; to?: string }>({ from: startOfMonth(), to: today() });
  const invalid = !!range.from && !!range.to && range.from > range.to;
  const { data, isLoading, error, refetch } = useDashboardSummary(side, invalid ? {} : range);

  const agingData = AGING_LABELS.map((b) => ({ label: b.label, amount: Number(data?.aging?.[b.key] ?? 0) }));
  const totalOutstanding = agingData.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <DateRangePicker label="Paid in period" className="w-72" value={range} onChange={setRange} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          onClick={() => void refetch()}
          disabled={isLoading}
          aria-label="Refresh dashboard"
          title="Refresh"
        >
          <i className={`ri-refresh-line text-base ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {invalid ? (
        <p className="text-sm text-destructive">The start date must be before the end date.</p>
      ) : isLoading ? (
        <div className="flex flex-col gap-5" aria-busy="true">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Panel key={i} className="p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-8 w-28" />
                <Skeleton className="mt-2 h-3 w-16" />
              </Panel>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="p-4 lg:col-span-2">
              <Skeleton className="mb-3 h-4 w-16" />
              <Skeleton className="h-64 w-full" />
            </Panel>
            <Panel className="p-4">
              <Skeleton className="mb-3 h-4 w-32" />
              <div className="space-y-3 py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </Panel>
          </div>
          <Panel className="overflow-hidden p-4">
            <Skeleton className="mb-4 h-4 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </Panel>
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={`Open ${copy.docs}`}
              value={formatMoney(data.totals.open)}
              hint={`${data.totals.openCount} open`}
            />
            <StatCard
              label="Overdue"
              value={formatMoney(data.totals.overdue)}
              hint={`${data.totals.overdueCount} past due`}
              tone={data.totals.overdue > 0 ? 'destructive' : 'default'}
            />
            <StatCard
              label="Paid in period"
              value={formatMoney(data.totals.paidInPeriod)}
              hint={`${data.totals.paidCountInPeriod} paid`}
              tone="success"
            />
            <StatCard label="Drafts" value={data.totals.draftCount} hint={`${copy.docs} not issued yet`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="p-4 lg:col-span-2">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-sm font-medium">Aging</p>
                <p className="text-xs text-muted-foreground">Outstanding {formatMoney(totalOutstanding)}</p>
              </div>
              {totalOutstanding === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Nothing outstanding.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agingData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => formatCompact(Number(v))} tick={{ fontSize: 12 }} width={48} />
                      <Tooltip formatter={(v) => formatMoney(Number(v))} />
                      <Bar dataKey="amount" name="Amount" fill="#005D1F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel className="p-4">
              <p className="mb-3 text-sm font-medium">{copy.topTitle}</p>
              {data.top.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">No open balances.</p>
              ) : (
                <ul className="divide-y divide-black/[0.06]">
                  {data.top.map((t) => (
                    <li key={t.referenceId} className="flex justify-between gap-3 py-2 text-sm">
                      <span className="truncate">{t.name}</span>
                      <span className="tabular-nums">{formatMoney(t.balance)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
              <p className="text-sm font-medium">Recent {copy.docs}</p>
              <Link href={copy.listHref} className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {data.recent.length === 0 ? (
              <EmptyState title={`No ${copy.docs} yet`} />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-normal">Number</th>
                    <th className="px-4 py-2 font-normal">{copy.party}</th>
                    <th className="px-4 py-2 font-normal">Issued</th>
                    <th className="px-4 py-2 font-normal">Due</th>
                    <th className="px-4 py-2 font-normal">Status</th>
                    <th className="px-4 py-2 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {data.recent.map((r) => (
                    <tr key={r.uuid}>
                      <td className="px-4 py-2">{r.code}</td>
                      <td className="px-4 py-2">{r.party ?? '—'}</td>
                      <td className="px-4 py-2">{formatDate(r.issuedDate)}</td>
                      <td className="px-4 py-2">{formatDate(r.dueDate)}</td>
                      <td className="px-4 py-2">
                        <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatMoney(r.total, r.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </>
      )}
    </div>
  );
};

export default ArApDashboard;
