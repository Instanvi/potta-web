import axios from 'config/axios.config';
import type { ListMeta } from '@/hooks/use-server-pagination';

/** Pluggable CRUD client used by BooksResourcePage (default: potta-backend). */
export type BooksResourceClient = {
  list: (
    path: string,
    filter?: Record<string, unknown>,
    params?: Record<string, unknown>,
  ) => Promise<unknown>;
  get: (path: string, id: string) => Promise<unknown>;
  create: (path: string, data: unknown) => Promise<unknown>;
  update: (path: string, id: string, data: unknown) => Promise<unknown>;
  remove: (path: string, id: string) => Promise<unknown>;
  action: (path: string, id: string, action: string, data?: unknown) => Promise<unknown>;
};

/** Generic Books CRUD helpers. Paths match potta-backend `@Controller` names. */
export const booksApi: BooksResourceClient = {
  list: (path: string, filter: Record<string, unknown> = {}, params: Record<string, unknown> = {}) =>
    axios.post(`/${path}/filter`, filter, { params }).then((r) => r.data),
  get: (path: string, id: string) => axios.get(`/${path}/details/${id}`).then((r) => r.data),
  create: (path: string, data: unknown) => axios.post(`/${path}/create`, data).then((r) => r.data),
  update: (path: string, id: string, data: unknown) =>
    axios.put(`/${path}/${id}`, data).then((r) => r.data),
  remove: (path: string, id: string) => axios.delete(`/${path}/${id}`).then((r) => r.data),
  action: (path: string, id: string, action: string, data?: unknown) =>
    axios.post(`/${path}/${id}/${action}`, data).then((r) => r.data),
};

/** Normalize list payloads from nestjs-paginate (`data`) or custom `{ items }` / raw arrays. */
export function extractBooksRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
  if (Array.isArray(obj.items)) return obj.items as Record<string, unknown>[];
  if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[];
  return [];
}

/** Pagination `meta` from nestjs-paginate list payloads (undefined for raw arrays / custom shapes). */
export function extractBooksMeta(payload: unknown): ListMeta {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return undefined;
  const meta = (payload as Record<string, unknown>).meta;
  return meta && typeof meta === 'object' ? (meta as ListMeta) : undefined;
}

export function rowId(row: Record<string, unknown>): string {
  return String(row.uuid ?? row.id ?? '');
}

export function cellValue(row: Record<string, unknown>, key: string): string {
  const parts = key.split('.');
  let cur: unknown = row;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return '—';
    cur = (cur as Record<string, unknown>)[p];
  }
  if (cur == null || cur === '') return '—';
  if (typeof cur === 'object') return JSON.stringify(cur);
  if (typeof cur === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(cur)) {
    const d = new Date(cur);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
  return String(cur);
}
