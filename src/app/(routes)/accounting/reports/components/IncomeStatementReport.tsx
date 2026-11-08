'use client';
import { useState } from 'react';
import Input from '@potta/components/input';
import {
  formatAmount,
  formatDate,
  startOfYear,
  today,
} from '../../../_shared/format';
import { EmptyState, ErrorState, LoadingState } from '../../../_shared/states';
import { useIncomeStatement } from '../hooks';
import ReportSection from './ReportSection';

const sum = (lines?: Record<string, number>) =>
  Object.values(lines ?? {}).reduce((s, v) => s + Number(v), 0);

const IncomeStatementReport = ({ hideZero }: { hideZero: boolean }) => {
  const [startDate, setStartDate] = useState(startOfYear());
  const [endDate, setEndDate] = useState(today());
  const invalidRange = !!startDate && !!endDate && startDate > endDate;
  const { data, isLoading, error, refetch } = useIncomeStatement(startDate, endDate);

  const isEmpty =
    data && !Object.keys(data.incomes ?? {}).length && !Object.keys(data.expenses ?? {}).length;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="w-44">
          <Input
            type="date"
            name="startDate"
            label="From"
            value={startDate}
            onchange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Input
            type="date"
            name="endDate"
            label="To"
            value={endDate}
            onchange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      {invalidRange ? (
        <p className="text-sm text-red-600">The start date must be before the end date.</p>
      ) : isLoading ? (
        <LoadingState label="Generating income statement..." />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || isEmpty ? (
        <EmptyState
          title="No income or expense accounts"
          description="Seed the chart of accounts and post transactions to see an income statement."
        />
      ) : (
        <div className="max-w-3xl">
          <p className="text-sm text-gray-500 mb-4">
            {formatDate(startDate)} – {formatDate(endDate)}
          </p>
          <ReportSection
            title="Income"
            lines={data.incomes}
            total={sum(data.incomes)}
            hideZero={hideZero}
          />
          <ReportSection
            title="Expenses"
            lines={data.expenses}
            total={sum(data.expenses)}
            hideZero={hideZero}
          />
          <div
            className={`flex justify-between px-4 py-3 font-medium ${
              data.netProfitLoss >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
            }`}
          >
            <span>{data.netProfitLoss >= 0 ? 'Net profit' : 'Net loss'}</span>
            <span className="tabular-nums">{formatAmount(data.netProfitLoss)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeStatementReport;
