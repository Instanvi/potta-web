import { DEFAULT_FORMAT, MONEY_FORMAT } from './format';
import type { DashboardWidget } from './types';

export const BUILTIN_DASHBOARD_NAME = 'Books overview';

/** Shown on Home until the user sets a personal default dashboard. */
export const BUILTIN_BOOKS_DASHBOARD: DashboardWidget[] = [
  {
    id: 'builtin-open-invoices',
    type: 'kpi',
    title: 'Open invoices',
    w: 4,
    config: {
      entity: 'invoices',
      aggregation: 'count',
      field: null,
      statuses: ['ISSUED', 'APPROVED', 'OVERDUE'],
      format: DEFAULT_FORMAT,
    },
  },
  {
    id: 'builtin-open-ar',
    type: 'kpi',
    title: 'Open AR',
    w: 4,
    config: {
      entity: 'invoices',
      aggregation: 'sum',
      field: 'invoiceTotal',
      statuses: ['ISSUED', 'APPROVED', 'OVERDUE'],
      format: MONEY_FORMAT,
    },
  },
  {
    id: 'builtin-open-bills',
    type: 'kpi',
    title: 'Open bills',
    w: 4,
    config: {
      entity: 'bills',
      aggregation: 'sum',
      field: 'invoiceTotal',
      statuses: ['ISSUED', 'APPROVED', 'OVERDUE'],
      format: MONEY_FORMAT,
    },
  },
  {
    id: 'builtin-invoices-by-status',
    type: 'chart',
    title: 'Invoices by status',
    w: 8,
    config: {
      entity: 'invoices',
      aggregation: 'count',
      field: null,
      statuses: [],
      format: DEFAULT_FORMAT,
      chartType: 'bar',
      groupBy: 'status',
      limit: 10,
    },
  },
  {
    id: 'builtin-products',
    type: 'kpi',
    title: 'Products',
    w: 4,
    config: {
      entity: 'products',
      aggregation: 'count',
      field: null,
      statuses: ['enabled'],
      format: DEFAULT_FORMAT,
    },
  },
  {
    id: 'builtin-recent-invoices',
    type: 'entity_list',
    title: 'Recent invoices',
    w: 12,
    config: {
      entity: 'invoices',
      sort: 'createdAt',
      order: 'desc',
      pageSize: 5,
      searchable: false,
    },
  },
];
