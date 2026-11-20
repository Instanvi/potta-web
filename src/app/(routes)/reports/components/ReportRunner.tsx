'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import Search from '@potta/components/search';
import { DatePicker, DateRangePicker } from '@potta/components/ui/date-picker';
import { ExportButton } from '@/components/export-button';
import { formatAmount, today, startOfMonth } from '../../_shared/format';
import { EmptyState, ErrorState, ListToolbar, LoadingState } from '../../_shared/states';
import { useReportRun } from '../hooks';
import type { ReportColumn } from '../utils/api';
import { ReportPageShell } from './ReportPageShell';
import { loadReportScope } from '@/lib/reports-catalog';

function formatCell(value: unknown, type: ReportColumn['type']) {
  if (value == null || value === '') return '—';
  if (type === 'money') return formatAmount(value);
  if (type === 'number') return Number(value).toLocaleString();
  return String(value);
}

export function ReportRunner({
  reportId,
  title,
  description,
  mode = 'range',
}: {
  reportId: string;
  title: string;
  description?: string;
  mode?: 'range' | 'asOf' | 'compare';
}) {
  const [range, setRange] = useState<{ from?: string; to?: string }>({
    from: startOfMonth(),
    to: today(),
  });
  const [asOfDate, setAsOfDate] = useState(today());
  const [compareEnd, setCompareEnd] = useState(startOfMonth());
  const [search, setSearch] = useState('');

  const params = useMemo(() => {
    const scope = loadReportScope();
    if (mode === 'asOf') return { asOfDate, search: search || undefined, scope };
    if (mode === 'compare') {
      return {
        asOfDate,
        compareEnd,
        startDate: range.from,
        endDate: range.to,
        search: search || undefined,
        scope,
      };
    }
    return {
      startDate: range.from,
      endDate: range.to,
      asOfDate: range.to || today(),
      search: search || undefined,
      scope,
    };
  }, [mode, asOfDate, compareEnd, range, search]);

  const { data, isLoading, error, refetch } = useReportRun(reportId, params);

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
    return (data?.columns ?? []).map((col: ReportColumn) => ({
      id: col.key,
      accessorKey: col.key,
      header: () => (
        <div className={col.type === 'money' || col.type === 'number' ? 'w-full text-right' : ''}>
          {col.label}
        </div>
      ),
      cell: ({ row }: { row: { original: Record<string, unknown> } }) => (
        <div
          className={
            col.type === 'money' || col.type === 'number'
              ? 'w-full text-right tabular-nums'
              : 'truncate'
          }
        >
          {formatCell(row.original[col.key], col.type)}
        </div>
      ),
    }));
  }, [data?.columns]);

  return (
    <ReportPageShell
      title={title}
      description={description}
      actions={
        <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
          Back to reports
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        <ListToolbar
          actions={
            <ExportButton
              filename={reportId}
              rows={data?.rows ?? []}
              columns={(data?.columns ?? []).map((c: ReportColumn) => ({
                key: c.key,
                header: c.label,
                value: (row: Record<string, unknown>) => formatCell(row[c.key], c.type),
              }))}
            />
          }
        >
          {mode === 'asOf' || mode === 'compare' ? (
            <DatePicker
              id={`${reportId}-asOf`}
              label="As of"
              className="w-52"
              value={asOfDate}
              onChange={(v) => setAsOfDate(v || today())}
            />
          ) : (
            <DateRangePicker
              label="Period"
              className="w-72"
              value={range}
              onChange={setRange}
            />
          )}
          {mode === 'compare' && (
            <DatePicker
              id={`${reportId}-compare`}
              label="Compare as of"
              className="w-52"
              value={compareEnd}
              onChange={(v) => setCompareEnd(v || startOfMonth())}
            />
          )}
          <div className="flex w-full max-w-sm flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Search</label>
            <Search
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="w-full"
            />
          </div>
        </ListToolbar>

        {data?.notes?.length ? (
          <p className="text-xs text-muted-foreground">{data.notes.join(' ')}</p>
        ) : null}

        {isLoading ? (
          <LoadingState label="Running report…" />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.rows?.length ? (
          <EmptyState
            variant="plain"
            title={data?.notes?.length ? 'Report unavailable' : 'No rows'}
            description={
              data?.notes?.length
                ? data.notes.join(' ')
                : 'Nothing matched these filters for this report. Try another period or organization scope.'
            }
          />
        ) : (
          <>
            {data.totals && Object.keys(data.totals).length > 0 && (
              <div className="flex flex-wrap gap-4 text-sm">
                {Object.entries(data.totals).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-muted-foreground">{k}: </span>
                    <span className="font-medium tabular-nums">{formatAmount(v)}</span>
                  </div>
                ))}
              </div>
            )}
            <DataTable columns={columns} data={data.rows} />
          </>
        )}
      </div>
    </ReportPageShell>
  );
}
