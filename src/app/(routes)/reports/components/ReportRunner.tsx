'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import { DatePicker, DateRangePicker } from '@potta/components/ui/date-picker';
import { DocumentSellerHeader } from '@/components/documents/document-seller-header';
import { ReportExportMenu } from '@/components/report-export-menu';
import { formatAmount, today, startOfMonth } from '../../_shared/format';
import { EmptyState, ErrorState, ListToolbar, LoadingState } from '../../_shared/states';
import { useReportRun } from '../hooks';
import type { ReportColumn } from '../utils/api';
import { ReportPageShell } from './ReportPageShell';
import { loadReportScope } from '@/lib/reports-catalog';
import { ReportPdfDocument } from '@/components/documents/report-pdf-document';
import { useOrganizationProfile } from '@/hooks/use-organization-profile';
import { orgToSeller } from '@/lib/org-to-seller';
import { printReactPdf } from '@/lib/print-react-pdf';
import { toast } from 'sonner';

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
  const { data: org } = useOrganizationProfile();
  const [printing, setPrinting] = useState(false);

  const periodLabel =
    mode === 'asOf' || mode === 'compare'
      ? `As of ${asOfDate}`
      : `Period ${range.from ?? '—'} – ${range.to ?? '—'}`;

  const onPrint = async () => {
    if (!data?.rows?.length || printing) return;
    setPrinting(true);
    try {
      await printReactPdf(
        <ReportPdfDocument
          seller={orgToSeller(org)}
          title={title}
          description={description}
          period={periodLabel}
          columns={data.columns}
          rows={data.rows}
          totals={data.totals}
        />,
        title || reportId,
      );
    } catch (err) {
      console.error(err);
      toast.error('Could not generate PDF');
    } finally {
      setPrinting(false);
    }
  };

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
        <Link href="/reports" className="text-sm font-medium text-primary hover:underline print:hidden">
          Back to reports
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        <ListToolbar
          className="print:hidden"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                text={printing ? 'Preparing…' : 'Print'}
                theme="lightBlue"
                color
                disabled={!data?.rows?.length || printing}
                icon={<i className="ri-printer-line" />}
                onClick={() => void onPrint()}
              />
              <ReportExportMenu
                reportId={reportId}
                title={title}
                params={params}
                period={periodLabel}
                description={description}
                columns={data?.columns ?? []}
                rows={data?.rows ?? []}
                disabled={!data?.rows?.length}
              />
            </div>
          }
        >
          {mode === 'asOf' || mode === 'compare' ? (
            <DatePicker
              id={`${reportId}-asOf`}
              className="w-52"
              value={asOfDate}
              onChange={(v) => setAsOfDate(v || today())}
            />
          ) : (
            <DateRangePicker
              className="w-72"
              value={range}
              onChange={setRange}
            />
          )}
          {mode === 'compare' && (
            <DatePicker
              id={`${reportId}-compare`}
              className="w-52"
              value={compareEnd}
              onChange={(v) => setCompareEnd(v || startOfMonth())}
            />
          )}
          <Search
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            className="w-full max-w-sm"
          />
        </ListToolbar>

        {data?.notes?.length ? (
          <p className="text-xs text-muted-foreground print:hidden">{data.notes.join(' ')}</p>
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
                : 'Nothing matched these filters. Pick another period, location, or organization scope and try again.'
            }
          />
        ) : (
          <div
            data-report-print
            className="space-y-4 rounded-[2px] border border-black/[0.08] bg-white p-4 print:border-0 print:p-0"
          >
            <header className="border-b border-black/[0.08] pb-4">
              <DocumentSellerHeader label="" compact />
              <div className="mt-3 space-y-0.5">
                <h2 className="text-base font-medium text-foreground">{title}</h2>
                {description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {mode === 'asOf' || mode === 'compare'
                    ? `As of ${asOfDate}`
                    : `Period ${range.from ?? '—'} – ${range.to ?? '—'}`}
                </p>
              </div>
            </header>
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
            <DataTable
              columns={columns}
              data={data.rows}
              storageKey={`report-${reportId}-table`}
              withRowSelection={false}
            />
          </div>
        )}
      </div>
    </ReportPageShell>
  );
}
