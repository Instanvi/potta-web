'use client';
import { useState } from 'react';
import Input from '@potta/components/input';
import { formatAmount, formatDate, today } from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState } from '../../../_shared/states';
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
    <div>
      <div className="w-44 mb-6">
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
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">As of {formatDate(asOfDate)}</p>
            <span
              className={`px-2 py-0.5 text-xs font-medium border ${
                data.isBalanced
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-red-300 bg-red-50 text-red-600'
              }`}
            >
              {data.isBalanced ? 'Balanced' : 'Out of balance'}
            </span>
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
          <div className="flex justify-between bg-gray-50 px-4 py-3 font-medium">
            <span>Total liabilities + equity</span>
            <span className="tabular-nums">
              {formatAmount(data.totalLiabilities + data.totalEquity)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetReport;
