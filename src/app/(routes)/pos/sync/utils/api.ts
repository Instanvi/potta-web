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

export type SyncRequestStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';

export interface SyncRequestTallies {
  created: number;
  updated: number;
  duplicate: number;
  failed: number;
}

export interface SyncRequest {
  id: string;
  orgId: string;
  locationContextId: string | null;
  endpoint: string;
  idempotencyKey: string;
  status: SyncRequestStatus;
  response: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRequestSummary {
  id: string;
  orgId: string;
  locationContextId: string | null;
  endpoint: string;
  idempotencyKey: string;
  status: SyncRequestStatus;
  createdAt: string;
  updatedAt: string;
  tallies: SyncRequestTallies;
  recordCount: number;
  errorMessage: string | null;
}

export interface SyncRequestListResponse {
  items: SyncRequestSummary[];
  total: number;
  page: number;
  limit: number;
  counts: Record<SyncRequestStatus, number>;
}

export interface SyncRequestListParams {
  status?: SyncRequestStatus | SyncRequestStatus[];
  endpoint?: string;
  page?: number;
  limit?: number;
}

/** Friendly labels for sync batch endpoints shown on the activity board. */
export const ENDPOINT_LABELS: Record<string, string> = {
  'pos-sync:transactions': 'Sales',
  'pos-sync:expenses': 'Expenses',
  'pos-sync:customers': 'Customers',
  'pos-sync:customer-payments': 'Customer payments',
  'pos-sync:products': 'Products',
  'pos-sync:product-variations': 'Product variations',
  'pos-sync:vendors': 'Vendors',
  'pos-sync:categories': 'Categories',
  'pos-sync:modifiers': 'Modifiers',
  'pos-sync:product-attributes': 'Product attributes',
  'pos-sync:product-attribute-values': 'Attribute values',
  'pos-sync:variation-attribute-values': 'Variation attributes',
  'pos-sync:product-unit-pricing': 'Unit pricing',
  'pos-sync:product-cost-history': 'Cost history',
  'pos-sync:bundle-items': 'Bundles',
  'pos-sync:bundle-components': 'Bundle components',
  'pos-sync:waiting-transactions': 'Waiting transactions',
  'pos-sync:market-requests': 'Market requests',
  'pos-sync:market-request-items': 'Market request items',
  'pos-sync:purchase-orders': 'Purchase orders',
  'pos-sync:purchase-order-line-items': 'PO line items',
  'pos-sync:inventory-operations': 'Inventory operations',
};

export const STATUS_LABELS: Record<SyncRequestStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Ongoing',
  SUCCEEDED: 'Success',
  FAILED: 'Failed',
};

export function endpointLabel(endpoint: string): string {
  if (ENDPOINT_LABELS[endpoint]) return ENDPOINT_LABELS[endpoint];
  const trimmed = endpoint.replace(/^pos-sync:/, '').replace(/-/g, ' ');
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
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
  listRequests: async (params: SyncRequestListParams = {}): Promise<SyncRequestListResponse> => {
    const query: Record<string, string | number> = {};
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    if (params.endpoint) query.endpoint = params.endpoint;
    if (params.status) {
      query.status = Array.isArray(params.status) ? params.status.join(',') : params.status;
    }
    const res = await axios.get('/pos-sync/requests', { params: query });
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
  requests: (params: SyncRequestListParams) => ['pos-sync', 'requests', params] as const,
  request: (id: string) => ['pos-sync', 'requests', id] as const,
};
