import { useMutation, useQueries } from '@tanstack/react-query';
import { isTerminalStatus, payExportApi, type PayExportRequest } from '../_utils/payExportApi';

const POLL_MS = 3000;
const MAX_POLL_MS = 2 * 60 * 1000;

export const payExportKeys = {
  all: ['pay-export'] as const,
  status: (endpoint: string, key: string, targetLocationId?: string) =>
    ['pay-export', 'status', endpoint, key, targetLocationId ?? 'current'] as const,
};

export function useExportToPay() {
  return useMutation({
    mutationKey: payExportKeys.all,
    mutationFn: payExportApi.exportToPayments,
  });
}

/** Polls every sync request every 3s until it settles or ~2 minutes pass. */
export function usePayExportStatuses(
  requests: PayExportRequest[],
  targetLocationId: string | undefined,
  startedAt: number | null,
) {
  return useQueries({
    queries: requests.map((r) => ({
      queryKey: payExportKeys.status(r.endpoint, r.idempotencyKey, targetLocationId),
      queryFn: () => payExportApi.status({ endpoint: r.endpoint, key: r.idempotencyKey, targetLocationId }),
      enabled: startedAt !== null,
      retry: 1,
      refetchInterval: (query: { state: { data?: { status: string } } }) => {
        if (startedAt === null || Date.now() - startedAt > MAX_POLL_MS) return false;
        return isTerminalStatus(query.state.data?.status) ? false : POLL_MS;
      },
    })),
  });
}

export const PAY_EXPORT_MAX_POLL_MS = MAX_POLL_MS;
