import axios from 'config/axios.config';

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
};

export const reportsApi = {
  run: async (reportId: string, params: ReportRunParams) => {
    const res = await axios.get<ReportResult>(`/reports/${reportId}/run`, { params });
    return res.data;
  },
};
