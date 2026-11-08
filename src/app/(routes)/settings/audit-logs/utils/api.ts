import axios from 'config/axios.config';

export type AuditActorType = 'USER' | 'SERVICE' | 'SYSTEM';

export interface AuditLog {
  id: string;
  orgId: string | null;
  locationContextId: string | null;
  actorType: AuditActorType | string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  requestId: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface AuditLogQuery {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  locationContextId?: string;
  action?: string;
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
  page?: number;
  limit?: number;
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'inapp';
export type NotificationLogStatus = 'PUBLISHED' | 'FAILED' | 'SKIPPED';

export interface NotificationLog {
  id: string;
  channel: NotificationChannel | string;
  recipient: string | null;
  businessEvent: string | null;
  idempotencyKey: string | null;
  correlationId: string | null;
  subject: string | null;
  status: NotificationLogStatus | string;
  error: string | null;
  createdAt: string;
}

export interface NotificationLogQuery {
  channel?: NotificationChannel;
  status?: NotificationLogStatus;
  page?: number;
  limit?: number;
}

function compact<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Partial<T>;
}

function toPage<T>(raw: unknown, fallback: { page: number; limit: number }): Paginated<T> {
  const body = (raw ?? {}) as Partial<Paginated<T>>;
  const data = Array.isArray(body.data) ? body.data : Array.isArray(raw) ? (raw as T[]) : [];
  const total = body.meta?.total ?? data.length;
  const limit = body.meta?.limit ?? fallback.limit;
  return {
    data,
    meta: {
      page: body.meta?.page ?? fallback.page,
      limit,
      total,
      totalPages: body.meta?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit))),
    },
  };
}

export const auditApi = {
  list: async (query: AuditLogQuery): Promise<Paginated<AuditLog>> => {
    const res = await axios.get('/audit-logs', { params: compact(query) });
    return toPage<AuditLog>(res.data, { page: query.page ?? 1, limit: query.limit ?? 50 });
  },

  history: async (
    entityType: string,
    entityId: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<Paginated<AuditLog>> => {
    const res = await axios.get(
      `/audit-logs/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
      { params: compact(params) },
    );
    return toPage<AuditLog>(res.data, { page: params.page ?? 1, limit: params.limit ?? 50 });
  },
};

export const notificationLogsApi = {
  list: async (query: NotificationLogQuery): Promise<Paginated<NotificationLog>> => {
    const res = await axios.get('/notification-logs', { params: compact(query) });
    return toPage<NotificationLog>(res.data, { page: query.page ?? 1, limit: query.limit ?? 50 });
  },
};
