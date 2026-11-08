import axios from 'config/axios.config';

/** PosSyncEntityKind values from potta-backend pos-sync DTOs. */
export const POS_SYNC_KINDS = [
  'sale',
  'expense',
  'reversal',
  'customer',
  'product',
  'vendor',
  'category',
  'modifier',
  'bundle',
  'bundle_component',
  'product_variation',
  'product_attribute',
  'product_attribute_value',
  'variation_attribute_value',
  'product_unit_pricing',
  'product_cost_history',
  'waiting_transaction',
  'market_request',
  'market_request_item',
  'purchase_order',
  'purchase_order_line_item',
  'account',
  'invoice',
  'customer_payment',
] as const;

export type PosSyncKind = (typeof POS_SYNC_KINDS)[number];

type NumericLike = string | number | null;

export interface ReconcileResponse {
  error: boolean;
  message: string;
  scope: { orgId: string; locationContextId: string | null; from: string; to: string };
  mappings: { sales: number; expenses: number; reversals: number };
  transactionsCollect: {
    pos_sales_total?: NumericLike;
    pos_expenses_total?: NumericLike;
    pos_sales_count?: NumericLike;
    pos_expenses_count?: NumericLike;
  };
  generalLedger: {
    revenue_credit_701?: NumericLike;
    expense_debit_629?: NumericLike;
    cash_debit_571?: NumericLike;
    cash_credit_571?: NumericLike;
  };
}

export interface EntityHealthResponse {
  unmapped_native: { kind: string; potta_id: string; business_key: string | null }[];
  orphan_cross_refs: {
    from_kind: string;
    from_external_id: string;
    to_kind: string;
    to_external_id: string;
    relation: string;
  }[];
  stale_mappings: { kind: string; external_id: string; potta_id: string }[];
  duplicate_business_keys: { kind: string; business_key: string; count: number }[];
}

export interface MappingItem {
  kind: PosSyncKind;
  storage_tier: string;
  external_id: string;
  potta_id: string;
  business_key: string | null;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface MappingsResponse {
  items: MappingItem[];
  next_cursor: string | null;
  has_more: boolean;
  server_time: string;
}

export interface MappingsParams {
  cursor?: string;
  limit?: number;
  since?: string;
  kinds?: PosSyncKind[];
}

export interface FeedItem {
  eventId: string;
  kind: PosSyncKind;
  externalSource: string;
  externalId: string;
  op: 'upsert';
  updatedAt: string;
  payload?: Record<string, unknown> | null;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
  highWatermark: string;
}

export interface FeedParams {
  cursor?: string;
  limit?: number;
  kinds?: PosSyncKind[];
  from?: string;
  to?: string;
}

export interface SyncRequest {
  id: string;
  orgId: string;
  locationContextId: string | null;
  endpoint: string;
  idempotencyKey: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  response: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export const posSyncApi = {
  reconcile: async (from: string, to: string): Promise<ReconcileResponse> => {
    const res = await axios.get('/pos-sync/reconcile', { params: { from, to } });
    return res.data;
  },
  entityHealth: async (): Promise<EntityHealthResponse> => {
    const res = await axios.get('/pos-sync/reconcile/entities');
    return res.data;
  },
  mappings: async ({ kinds, ...params }: MappingsParams): Promise<MappingsResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') query.append(k, String(v));
    });
    kinds?.forEach((k) => query.append('kinds', k));
    const res = await axios.get(`/pos-sync/mappings?${query.toString()}`);
    return res.data;
  },
  feed: async ({ kinds, ...params }: FeedParams): Promise<FeedResponse> => {
    const res = await axios.get('/pos-sync/feed', {
      params: {
        ...Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
        ),
        ...(kinds?.length ? { kinds: kinds.join(',') } : {}),
      },
    });
    return res.data;
  },
  request: async (id: string): Promise<SyncRequest> => {
    const res = await axios.get(`/pos-sync/requests/${encodeURIComponent(id)}`);
    return res.data;
  },
};

export const posSyncKeys = {
  all: ['pos-sync'] as const,
  reconcile: (from: string, to: string) => ['pos-sync', 'reconcile', from, to] as const,
  entityHealth: () => ['pos-sync', 'reconcile', 'entities'] as const,
  mappings: (params: MappingsParams) => ['pos-sync', 'mappings', params] as const,
  feed: (params: FeedParams) => ['pos-sync', 'feed', params] as const,
  request: (id: string) => ['pos-sync', 'requests', id] as const,
};
