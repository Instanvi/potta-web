import { booksApi, extractBooksRows } from '@/lib/books-api';

export type ExpenseProject = Record<string, unknown> & {
  id?: string;
  uuid?: string;
  name?: string;
  status?: string;
  /** Soft target (budget_amount) for Books list/forms. */
  budget?: number | null;
  budgetId?: string | null;
  budget_id?: string | null;
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
    budget:
      (row.budget_amount as number | null | undefined) ??
      (row.budget as number | null | undefined) ??
      null,
    budgetId: (row.budgetId ?? row.budget_id ?? null) as string | null,
    budget_id: (row.budget_id ?? row.budgetId ?? null) as string | null,
    customerId: (row.customerId ?? row.customer_id ?? null) as string | null,
    customer_id: (row.customer_id ?? row.customerId ?? null) as string | null,
    startDate: toIsoDate(start) ?? null,
    endDate: toIsoDate(end) ?? null,
    start_date: toIsoDate(start) ?? null,
    end_date: toIsoDate(end) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
  };
}

/**
 * BooksResourceClient adapter — projects are stored in potta-backend (`/project`).
 * `resourcePath` is ignored; kept for BooksResourcePage compatibility.
 */
export const expenseProjectsApi = {
  list: async (
    _path: string,
    filter: Record<string, unknown> = {},
    params: Record<string, unknown> = {},
  ) => {
    const payload = await booksApi.list('project', filter, params);
    return { data: extractBooksRows(payload).map(normalizeProject) };
  },

  get: async (_path: string, id: string) => {
    const row = (await booksApi.get('project', id)) as Record<string, unknown>;
    return normalizeProject(row && typeof row === 'object' ? row : { id });
  },

  create: async (_path: string, data: unknown) => {
    const row = (await booksApi.create('project', data)) as Record<string, unknown>;
    return normalizeProject(row);
  },

  update: async (_path: string, id: string, data: unknown) => {
    const row = (await booksApi.update('project', id, data)) as Record<string, unknown>;
    return normalizeProject(row);
  },

  remove: async (_path: string, id: string) => {
    await booksApi.remove('project', id);
    return { id };
  },

  action: async () => {
    throw new Error('Project workflow actions are not supported');
  },
};
