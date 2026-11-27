'use client';

import React, { FC, useMemo, useState } from 'react';
import { DateRangePicker, DateRangeValue } from '@potta/components/ui/date-picker';
import { Tabs } from '../../../_shared/states';
import { useGetAllVouchers } from '../_hooks/hooks';
import { Skeleton } from '@potta/components/ui/loaders';

type Period = 'yesterday' | 'today' | 'this_week' | 'this_month' | 'custom';

const periods: { id: Period; label: string }[] = [
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const TYPE_CARDS = [
  { key: 'DISCOUNT', label: 'Discounts' },
  { key: 'CASHBACK', label: 'Cashbacks' },
  { key: 'GIFT_CARD', label: 'Gift cards' },
  { key: 'ROYALTY_POINTS', label: 'Loyalty points' },
] as const;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function asDate(value?: string | Date | null) {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function rangeForPeriod(period: Period, custom: DateRangeValue): { from?: Date; to?: Date } {
  const now = new Date();
  if (period === 'today') return { from: startOfDay(now), to: endOfDay(now) };
  if (period === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { from: startOfDay(y), to: endOfDay(y) };
  }
  if (period === 'this_week') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
    return { from, to: endOfDay(now) };
  }
  if (period === 'this_month') {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    return { from, to: endOfDay(now) };
  }
  const from = asDate(custom.from);
  const to = asDate(custom.to);
  return {
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
  };
}

const VouchersBox: FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
  const [range, setRange] = useState<DateRangeValue>({});
  const { data, isLoading } = useGetAllVouchers({
    page: 1,
    limit: 200,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const cards = useMemo(() => {
    const rows = (data?.data ?? []) as Array<{
      type?: string;
      createdAt?: string;
      scheduling?: { programStartDate?: string };
      active?: boolean;
    }>;
    const { from, to } = rangeForPeriod(selectedPeriod, range);

    const inRange = rows.filter((row) => {
      const raw = row.scheduling?.programStartDate || row.createdAt;
      if (!raw || (!from && !to)) return true;
      const when = new Date(raw);
      if (Number.isNaN(when.getTime())) return true;
      if (from && when < from) return false;
      if (to && when > to) return false;
      return true;
    });

    return TYPE_CARDS.map((card) => {
      const matches = inRange.filter(
        (row) => String(row.type || '').toUpperCase() === card.key,
      );
      const active = matches.filter((row) => row.active !== false).length;
      return {
        label: card.label,
        total: matches.length,
        active,
      };
    });
  }, [data?.data, range, selectedPeriod]);

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3">
        <Tabs tabs={periods} value={selectedPeriod} onChange={setSelectedPeriod} />
        {selectedPeriod === 'custom' && (
          <DateRangePicker
            className="w-auto min-w-[260px]"
            placeholder="Pick a date range"
            value={range}
            onChange={setRange}
          />
        )}
      </div>
      <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? TYPE_CARDS.map((card) => (
              <div key={card.key} className="dashboard-panel p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-16" />
              </div>
            ))
          : cards.map((item) => (
              <div key={item.label} className="dashboard-panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{item.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {item.active} active
                  </span>
                </div>
                <p className="mt-3 text-2xl font-medium tabular-nums text-foreground">
                  {item.total}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">vouchers</p>
              </div>
            ))}
      </div>
    </div>
  );
};

export default VouchersBox;
