import axios from 'config/axios.config';

/** Row of talk-BE's `notifications` table, as proxied by potta-backend `/notifications`. */
export type NotificationItem = {
  id: string;
  organizationId?: string;
  ownerId?: string | null;
  locationId?: string | null;
  type?: string;
  status?: string;
  subject?: string | null;
  title?: string | null;
  content?: string | null;
  body?: string | null;
  isRead?: boolean | null;
  readAt?: string | null;
  createdAt?: string | null;
  metadata?: {
    href?: unknown;
    businessEvent?: unknown;
    source?: unknown;
    [key: string]: unknown;
  } | null;
};

export type NotificationsPage = {
  items: NotificationItem[];
  meta: {
    totalItems: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
};

function unwrap<T>(body: unknown): T {
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) {
    return ((body as { data: T }).data ?? body) as T;
  }
  return body as T;
}

function toPage(body: unknown): NotificationsPage {
  const data = unwrap<NotificationsPage | NotificationItem[] | { data?: NotificationItem[] }>(body);
  if (Array.isArray(data)) return { items: data, meta: { totalItems: data.length } };
  const page = (data ?? {}) as Partial<NotificationsPage> & { data?: NotificationItem[] };
  const items = Array.isArray(page.items) ? page.items : Array.isArray(page.data) ? page.data : [];
  return { items, meta: { ...page.meta, totalItems: page.meta?.totalItems ?? items.length } };
}

export function notificationTitle(n: NotificationItem): string {
  return n.subject || n.title || 'Notification';
}

export function notificationBody(n: NotificationItem): string {
  return n.content || n.body || '';
}

export function notificationHref(n: NotificationItem): string | null {
  const href = n.metadata?.href;
  return typeof href === 'string' && href ? href : null;
}

export const notificationsService = {
  async list(params: { page?: number; limit?: number } = {}): Promise<NotificationsPage> {
    const res = await axios.get('/notifications', { params });
    return toPage(res.data);
  },

  /** Toggles read/unread. */
  async toggleRead(id: string) {
    const res = await axios.patch(`/notifications/${encodeURIComponent(id)}/read`, {});
    return unwrap(res.data);
  },

  async markAllRead() {
    const res = await axios.patch('/notifications/me/mark-all-read', {});
    return unwrap(res.data);
  },

  async clearAll() {
    const res = await axios.delete('/notifications/me/clear');
    return unwrap(res.data);
  },

  async deleteOne(id: string) {
    const res = await axios.delete(`/notifications/${encodeURIComponent(id)}`);
    return unwrap(res.data);
  },
};
