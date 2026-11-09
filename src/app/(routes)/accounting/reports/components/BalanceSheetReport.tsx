'use client';
import { useState } from 'react';
import Input from '@potta/components/input';
import { formatAmount, formatDate, today } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState, StatCard, StatusBadge } from '../../../_shared/states';
import { useBalanceSheet } from '../hooks';
import ReportSection from './ReportSection';

const BalanceSheetReport = ({ hideZero }: { hideZero: boolean }) => {
  const [asOfDate, setAsOfDate] = useState(today());
  const { data, isLoading, error, refetch } = useBalanceSheet(asOfDate);

  const isEmpty =
    data &&
    !Object.keys(data.assets ?? {}).length &&
    !Object.keys(data.liabilities ?? {}).length &&
    !Object.keys(data.equity ?? {}).length;
  const sectionSum = (lines?: Record<string, number>) =>
    Object.values(lines ?? {}).reduce((s, v) => s + Number(v), 0);
  const retainedEarnings = data ? data.totalEquity - sectionSum(data.equity) : 0;

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
        <LoadingState label="Generating balance sheet..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || isEmpty ? (
        <EmptyState
          title="No accounts to report"
          description="Seed the chart of accounts and post transactions to see a balance sheet."
        />
      ) : (
        <>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total assets" value={formatAmount(data.totalAssets)} />
          <StatCard label="Total liabilities" value={formatAmount(data.totalLiabilities)} />
          <StatCard label="Total equity" value={formatAmount(data.totalEquity)} />
        </div>
        <div className="dashboard-panel max-w-3xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
            <p className="text-sm text-muted-foreground">As of {formatDate(asOfDate)}</p>
            <StatusBadge tone={data.isBalanced ? 'success' : 'danger'}>
              {data.isBalanced ? 'Balanced' : 'Out of balance'}
            </StatusBadge>
          </div>
          <ReportSection
            title="Assets"
            lines={data.assets}
            total={data.totalAssets}
            hideZero={hideZero}
          />
          <ReportSection
            title="Liabilities"
            lines={data.liabilities}
            total={data.totalLiabilities}
            hideZero={hideZero}
          />
          <ReportSection
            title="Equity"
            lines={{
              ...data.equity,
              ...(Math.abs(retainedEarnings) >= 0.005
                ? { 'Current period result (revenue − expenses)': retainedEarnings }
                : {}),
            }}
            total={data.totalEquity}
            hideZero={hideZero}
          />
          <div className="flex justify-between border-t border-black/10 bg-brand-subtle px-4 py-3 text-sm font-medium">
            <span>Total liabilities + equity</span>
            <span className="tabular-nums">
              {formatAmount(data.totalLiabilities + data.totalEquity)}
            </span>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default BalanceSheetReport;
