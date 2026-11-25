'use client';
import { useMemo, useState } from 'react';
import { DateRangePicker, parseDateValue } from '@potta/components/ui/date-picker';
import { ReportExportMenu } from '@/components/report-export-menu';
import { StatementPdfDocument } from '@/components/documents/report-pdf-document';
import {
  formatAmount,
  formatDate,
  startOfYear,
  today,
} from '../../../_shared/format';
import { EmptyState, ErrorState, ListToolbar, LoadingState, StatCard } from '../../../_shared/states';
import { useIncomeStatement } from '../hooks';
import ReportSection from './ReportSection';

const toLines = (lines?: Record<string, number>, hideZero?: boolean) =>
  Object.entries(lines ?? {})
    .filter(([, amount]) => !hideZero || Math.abs(Number(amount)) >= 0.005)
    .map(([label, amount]) => ({ label, amount: Number(amount) }));

const sum = (lines?: Record<string, number>) =>
  Object.values(lines ?? {}).reduce((s, v) => s + Number(v), 0);

function flattenSection(section: string, lines?: Record<string, number>, hideZero?: boolean) {
  return Object.entries(lines ?? {})
    .filter(([, amount]) => !hideZero || Math.abs(Number(amount)) >= 0.005)
    .map(([account, amount]) => ({ section, account, amount: Number(amount) }));
}

const IncomeStatementReport = ({ hideZero }: { hideZero: boolean }) => {
  const [startDate, setStartDate] = useState(startOfYear());
  const [endDate, setEndDate] = useState(today());
  const invalidRange = !!startDate && !!endDate && startDate > endDate;
  const { data, isLoading, error, refetch } = useIncomeStatement(startDate, endDate);

  const isEmpty =
    data && !Object.keys(data.incomes ?? {}).length && !Object.keys(data.expenses ?? {}).length;

  const exportRows = useMemo(() => {
    if (!data) return [];
    return [
      ...flattenSection('Income', data.incomes, hideZero),
      ...flattenSection('Expenses', data.expenses, hideZero),
      {
        section: 'Net',
        account: data.netProfitLoss >= 0 ? 'Net profit' : 'Net loss',
        amount: Number(data.netProfitLoss) || 0,
      },
    ];
  }, [data, hideZero]);

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        className="print:hidden"
        actions={
          <div className="flex flex-wrap items-center gap-2">
          <ReportExportMenu
            reportId="profit-and-loss"
            title="Income statement"
            description="Profit and loss"
            period={`${startDate} – ${endDate}`}
            disabled={!exportRows.length || invalidRange}
            columns={[
              { key: 'section', label: 'Section', type: 'text' },
              { key: 'account', label: 'Account', type: 'text' },
              { key: 'amount', label: 'Amount', type: 'money' },
            ]}
            rows={exportRows}
            renderPdf={(seller) => (
              <StatementPdfDocument
                seller={seller}
                title="Income statement (Profit & Loss)"
                period={`${startDate} – ${endDate}`}
                sections={[
                  {
                    title: 'Income',
                    lines: toLines(data?.incomes, hideZero),
                    total: sum(data?.incomes),
                  },
                  {
                    title: 'Expenses',
                    lines: toLines(data?.expenses, hideZero),
                    total: sum(data?.expenses),
                  },
                ]}
                summary={[
                  {
                    label: (data?.netProfitLoss ?? 0) >= 0 ? 'Net profit' : 'Net loss',
                    amount: Number(data?.netProfitLoss) || 0,
                  },
                ]}
              />
            )}
          />
          </div>
        }
      >
        <DateRangePicker
          id="incomeStatementPeriod"
          label="Period"
          className="w-72"
          value={{ from: startDate, to: endDate }}
          onChange={({ from, to }) => {
            setStartDate(from || startOfYear());
            setEndDate(to || today());
          }}
        />
      </ListToolbar>
      {invalidRange ? (
        <p className="text-sm text-destructive">The start date must be before the end date.</p>
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
        <>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Income" value={formatAmount(sum(data.incomes))} />
          <StatCard label="Expenses" value={formatAmount(sum(data.expenses))} />
          <StatCard
            label={data.netProfitLoss >= 0 ? 'Net profit' : 'Net loss'}
            value={formatAmount(data.netProfitLoss)}
            tone={data.netProfitLoss >= 0 ? 'success' : 'destructive'}
          />
        </div>
        <div className="dashboard-panel max-w-3xl overflow-hidden">
          <p className="border-b border-black/[0.06] px-4 py-3 text-sm text-muted-foreground">
            {formatDate(parseDateValue(startDate))} – {formatDate(parseDateValue(endDate))}
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
            className={`flex justify-between border-t border-black/10 px-4 py-3 text-sm font-medium ${
              data.netProfitLoss >= 0 ? 'bg-brand-subtle text-primary' : 'bg-destructive/5 text-destructive'
            }`}
          >
            <span>{data.netProfitLoss >= 0 ? 'Net profit' : 'Net loss'}</span>
            <span className="tabular-nums">{formatAmount(data.netProfitLoss)}</span>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default IncomeStatementReport;
