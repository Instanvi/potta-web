import axios from 'config/axios.config';
import { isExpenseReportId, runExpenseReport } from '@/lib/expense-reports';

export type ReportColumn = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'money';
};

export type ReportResult = {
  reportId: string;
  title: string;
  generatedAt: string;
  filters: Record<string, string | undefined>;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totals?: Record<string, number>;
  notes?: string[];
};

export type ReportRunParams = {
  startDate?: string;
  endDate?: string;
  asOfDate?: string;
  compareStart?: string;
  compareEnd?: string;
  search?: string;
  /** branch (default) or organization — must match backend ReportRunQueryDto.scope */
  scope?: 'branch' | 'organization';
};

export type ReportExportFormat = 'csv' | 'xlsx' | 'pdf';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function filenameFromDisposition(header: string | undefined, fallback: string) {
  if (!header) return fallback;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1]?.trim() || fallback;
}

export const reportsApi = {
  run: async (reportId: string, params: ReportRunParams) => {
    if (isExpenseReportId(reportId)) {
      return runExpenseReport(reportId, params);
    }
    const res = await axios.get<ReportResult>(`/reports/${reportId}/run`, { params });
    return res.data;
  },

  /** Server-side file export for potta-backend catalog reports. */
  export: async (
    reportId: string,
    params: ReportRunParams & { format: ReportExportFormat },
  ) => {
    const res = await axios.get(`/reports/${reportId}/export`, {
      params,
      responseType: 'blob',
    });
    const fallback = `${reportId}.${params.format}`;
    const filename = filenameFromDisposition(
      res.headers?.['content-disposition'] as string | undefined,
      fallback,
    );
    const contentType =
      (res.headers?.['content-type'] as string | undefined) ||
      'application/octet-stream';
    downloadBlob(new Blob([res.data], { type: contentType }), filename);
  },
};
