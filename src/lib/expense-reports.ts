import { payrollClient } from 'config/axios.config';
import type { ReportColumn, ReportResult, ReportRunParams } from '@/app/(routes)/reports/utils/api';

/** Report ids owned by expense-be (`GET /expense/reports/:key`). Books catalog ids stay on potta-backend. */
export const EXPENSE_REPORT_KEYS = [
  'spend_summary',
  'expenses_by_vendor',
  'transaction_list_by_vendor',
  'unpaid_bills_summary',
] as const;

export type ExpenseReportKey = (typeof EXPENSE_REPORT_KEYS)[number];

export function isExpenseReportId(reportId: string): boolean {
  return (EXPENSE_REPORT_KEYS as readonly string[]).includes(reportId);
}

function backendKey(reportId: string): string {
  return reportId;
}

function inferColumns(rows: Record<string, unknown>[]): ReportColumn[] {
  if (!rows.length) return [{ key: 'message', label: 'Message', type: 'text' }];
  const keys = Object.keys(rows[0]);
  return keys.map((key) => {
    const sample = rows[0][key];
    const type: ReportColumn['type'] =
      key.includes('amount') || key.includes('total') || key === 'open_amount' || key === 'overdue_amount'
        ? 'money'
        : key.includes('count') || typeof sample === 'number'
          ? 'number'
          : key.includes('date')
            ? 'date'
            : 'text';
    return {
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      type,
    };
  });
}

export async function runExpenseReport(
  reportId: string,
  params: ReportRunParams,
): Promise<ReportResult> {
  const key = backendKey(reportId);
  const from = params.startDate;
  const to = params.endDate || params.asOfDate;
  const { data } = await payrollClient.get(`/expense/reports/${key}`, {
    params: {
      from,
      to,
    },
  });
  const payload = (data?.data ?? data) as {
    key?: string;
    generated_at?: string;
    summary?: Record<string, unknown>;
    rows?: Array<Record<string, unknown>>;
    period_start?: string;
    period_end?: string;
  };
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  return {
    reportId,
    title: reportId.replace(/[_-]/g, ' '),
    generatedAt: payload.generated_at || new Date().toISOString(),
    filters: {
      startDate: from,
      endDate: to,
      from: payload.period_start,
      to: payload.period_end,
    },
    columns: inferColumns(rows as Record<string, unknown>[]),
    rows: rows as Record<string, unknown>[],
    notes: payload.summary
      ? Object.entries(payload.summary).map(([k, v]) => `${k}: ${String(v)}`)
      : undefined,
  };
}
