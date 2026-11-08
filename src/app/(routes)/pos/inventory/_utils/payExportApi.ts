import axios from 'config/axios.config';

export interface PayExportRequest {
  endpoint: string;
  idempotencyKey: string;
  count: number;
  response: unknown;
}

export interface PayExportResult {
  payLocationId: string;
  products: number;
  categories: number;
  bundles: number;
  requests: PayExportRequest[];
}

export type PaySyncState = 'queued' | 'processing' | 'completed' | 'failed';

export interface PaySyncItemResult {
  external_id?: string;
  id?: string;
  status?: string;
  error?: string | null;
}

/** payment-service sync request status; normalized because its shape may vary. */
export interface PaySyncStatus {
  status: PaySyncState | string;
  results: PaySyncItemResult[];
  summary?: Record<string, unknown> | null;
  raw: unknown;
}

const TERMINAL = new Set(['completed', 'failed', 'done', 'succeeded', 'success', 'error', 'partial']);

export function isTerminalStatus(status?: string | null): boolean {
  return Boolean(status && TERMINAL.has(status.toLowerCase()));
}

export function isFailedItem(item: PaySyncItemResult): boolean {
  return Boolean(item.error) || /fail|error|reject/i.test(item.status ?? '');
}

function normalizeStatus(raw: unknown): PaySyncStatus {
  let body = raw as Record<string, unknown> | unknown[] | null;
  if (Array.isArray(body)) body = (body[0] as Record<string, unknown>) ?? null;
  const obj = (body ?? {}) as Record<string, unknown>;
  const results = [obj.results, obj.items, obj.result].find(Array.isArray) as PaySyncItemResult[] | undefined;
  const status = typeof obj.status === 'string' ? obj.status : typeof obj.state === 'string' ? obj.state : 'queued';
  const summary = obj.summary && typeof obj.summary === 'object' ? (obj.summary as Record<string, unknown>) : null;
  return { status: status.toLowerCase(), results: results ?? [], summary, raw };
}

export const payExportApi = {
  exportToPayments: async (body: { productIds?: string[]; targetLocationId?: string }): Promise<PayExportResult> => {
    const res = await axios.post('/Item/export-to-payments', body);
    const data = (res.data ?? {}) as Partial<PayExportResult>;
    return {
      payLocationId: data.payLocationId ?? body.targetLocationId ?? '',
      products: Number(data.products ?? 0),
      categories: Number(data.categories ?? 0),
      bundles: Number(data.bundles ?? 0),
      requests: Array.isArray(data.requests) ? data.requests : [],
    };
  },

  status: async (params: { endpoint: string; key: string; targetLocationId?: string }): Promise<PaySyncStatus> => {
    const res = await axios.get('/Item/export-to-payments/status', { params });
    return normalizeStatus(res.data);
  },
};
