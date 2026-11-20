'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, type ReportRunParams } from '../utils/api';

export function useReportRun(reportId: string, params: ReportRunParams, enabled = true) {
  return useQuery({
    queryKey: ['report-run', reportId, params],
    queryFn: () => reportsApi.run(reportId, params),
    enabled: enabled && !!reportId,
  });
}
