'use client';
import { useMemo, useState } from 'react';
import { DatePicker, parseDateValue } from '@potta/components/ui/date-picker';
import { ExportButton } from '@/components/export-button';
import { formatAmount, formatDate, today } from '../../../_shared/format';
import { EmptyState, ErrorState, ListToolbar, LoadingState, StatCard, StatusBadge } from '../../../_shared/states';
import { useBalanceSheet } from '../hooks';
import ReportSection from './ReportSection';
import { StatementPdfActions } from './StatementPdfActions';

const toLines = (lines?: Record<string, number>, hideZero?: boolean) =>
  Object.entries(lines ?? {})
    .filter(([, amount]) => !hideZero || Math.abs(Number(amount)) >= 0.005)
    .map(([label, amount]) => ({ label, amount: Number(amount) }));

function flattenSection(section: string, lines?: Record<string, number>, hideZero?: boolean) {
  return Object.entries(lines ?? {})
    .filter(([, amount]) => !hideZero || Math.abs(Number(amount)) >= 0.005)
    .map(([account, amount]) => ({ section, account, amount: Number(amount) }));
}

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

  const exportRows = useMemo(() => {
    if (!data) return [];
    const equityLines = {
      ...data.equity,
      ...(Math.abs(retainedEarnings) >= 0.005
        ? { 'Current period result (revenue − expenses)': retainedEarnings }
        : {}),
    };
    return [
      ...flattenSection('Assets', data.assets, hideZero),
      ...flattenSection('Liabilities', data.liabilities, hideZero),
      ...flattenSection('Equity', equityLines, hideZero),
    ];
  }, [data, hideZero, retainedEarnings]);

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        className="print:hidden"
        actions={
          <div className="flex flex-wrap items-center gap-2">
          <StatementPdfActions
            filename={`balance-sheet-${asOfDate}`}
            disabled={!data || !!isEmpty}
            statement={{
              title: 'Balance sheet',
              period: `As of ${asOfDate}`,
              sections: [
                {
                  title: 'Assets',
                  lines: toLines(data?.assets, hideZero),
                  total: data?.totalAssets,
                },
                {
                  title: 'Liabilities',
                  lines: toLines(data?.liabilities, hideZero),
                  total: data?.totalLiabilities,
                },
                {
                  title: 'Equity',
                  lines: toLines(
                    {
                      ...data?.equity,
                      ...(Math.abs(retainedEarnings) >= 0.005
                        ? { 'Current period result (revenue − expenses)': retainedEarnings }
                        : {}),
                    },
                    hideZero,
                  ),
                  total: data?.totalEquity,
                },
              ],
              summary: [
                {
                  label: 'Total liabilities + equity',
                  amount: (data?.totalLiabilities ?? 0) + (data?.totalEquity ?? 0),
                },
              ],
            }}
          />
          <ExportButton
            filename={`balance-sheet-${asOfDate}`}
            rows={exportRows}
            columns={[
              { key: 'section', header: 'Section' },
              { key: 'account', header: 'Account' },
              {
                key: 'amount',
                header: 'Amount',
                value: (row) => formatAmount(row.amount),
              },
            ]}
            disabled={!exportRows.length}
          />
          </div>
        }
      >
        <DatePicker
          id="balanceSheetAsOf"
          className="w-52"
          value={asOfDate}
          onChange={(value) => setAsOfDate(value || today())}
        />
      </ListToolbar>
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
            <p className="text-sm text-muted-foreground">As of {formatDate(parseDateValue(asOfDate))}</p>
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
