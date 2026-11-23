import { payrollClient } from 'config/axios.config';
import { extractBooksRows } from '@/lib/books-api';

export type ExpenseProject = Record<string, unknown> & {
  id?: string;
  uuid?: string;
  name?: string;
  status?: string;
  budget?: number | null;
  customerId?: string | null;
  customer_id?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  notes?: string | null;
};

function toIsoDate(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

/** Map expense snake_case rows to BooksResourcePage camelCase fields. */
export function normalizeProject(row: Record<string, unknown>): ExpenseProject {
  const start = row.startDate ?? row.start_date;
  const end = row.endDate ?? row.end_date;
  return {
    ...row,
    id: String(row.id ?? row.uuid ?? ''),
    uuid: String(row.id ?? row.uuid ?? ''),
    name: (row.name as string) ?? '',
    status: (row.status as string) ?? 'active',
    budget: (row.budget as number | null | undefined) ?? null,
    customerId: (row.customerId ?? row.customer_id ?? null) as string | null,
    customer_id: (row.customer_id ?? row.customerId ?? null) as string | null,
    startDate: toIsoDate(start) ?? null,
    endDate: toIsoDate(end) ?? null,
    start_date: toIsoDate(start) ?? null,
    end_date: toIsoDate(end) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
  };
}

function toExpenseBody(body: Record<string, unknown>) {
  return {
    name: body.name,
    customer_id: body.customerId ?? body.customer_id,
    status: body.status,
    budget: body.budget,
    start_date: body.startDate ?? body.start_date,
    end_date: body.endDate ?? body.end_date,
    notes: body.notes,
  };
}

/**
 * BooksResourceClient adapter — Projects SoT is expense-be `/expense/projects`.
 * `resourcePath` is ignored; kept for BooksResourcePage compatibility.
 */
export const expenseProjectsApi = {
  list: async (
    _path: string,
    filter: Record<string, unknown> = {},
    params: Record<string, unknown> = {},
  ) => {
    const res = await payrollClient.get('/expense/projects', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        search: typeof filter.search === 'string' ? filter.search : undefined,
      },
    });
    const payload = res.data?.data ?? res.data;
    const rows = extractBooksRows(payload).length
      ? extractBooksRows(payload)
      : extractBooksRows(res.data);
    return { data: rows.map(normalizeProject) };
  },

  get: async (_path: string, id: string) => {
    const res = await payrollClient.get(`/expense/projects/${id}`);
    const row = (res.data?.data ?? res.data) as Record<string, unknown>;
    return normalizeProject(row && typeof row === 'object' ? row : { id });
  },

  create: async (_path: string, data: unknown) => {
    const res = await payrollClient.post(
      '/expense/projects',
      toExpenseBody((data ?? {}) as Record<string, unknown>),
    );
    return normalizeProject((res.data?.data ?? res.data) as Record<string, unknown>);
  },

  update: async (_path: string, id: string, data: unknown) => {
    const res = await payrollClient.patch(
      `/expense/projects/${id}`,
      toExpenseBody((data ?? {}) as Record<string, unknown>),
    );
    return normalizeProject((res.data?.data ?? res.data) as Record<string, unknown>);
  },

  remove: async (_path: string, id: string) => {
    await payrollClient.delete(`/expense/projects/${id}`);
    return { id };
  },

  action: async () => {
    throw new Error('Project workflow actions are not supported on the expense API');
  },
};
