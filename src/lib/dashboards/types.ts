export type DashboardStatus = 'active' | 'archived';

export type EntityKey =
  | 'invoices'
  | 'bills'
  | 'purchase_orders'
  | 'customers'
  | 'vendors'
  | 'products'
  | 'journal_entries';

export type Aggregation = 'count' | 'sum' | 'avg' | 'min' | 'max';
export type ChartType = 'bar' | 'horizontal_bar' | 'donut' | 'table';
export type WidgetWidth = 3 | 4 | 6 | 8 | 12;

export interface NumberFormat {
  decimals: 'auto' | 0 | 1 | 2;
  scale: 'none' | 'K' | 'M' | 'B';
  currency: string | null;
}

export interface MeasureConfig {
  entity: EntityKey;
  aggregation: Aggregation;
  field: string | null;
  statuses: string[];
  format: NumberFormat;
}

export interface EntityListConfig {
  entity: EntityKey;
  sort: string;
  order: 'asc' | 'desc';
  pageSize: number;
  searchable: boolean;
}

export interface ChartConfig extends MeasureConfig {
  chartType: ChartType;
  groupBy: string;
  limit: number;
}

export type DashboardWidget =
  | { id: string; type: 'kpi'; title: string; w: WidgetWidth; config: MeasureConfig }
  | { id: string; type: 'chart'; title: string; w: WidgetWidth; config: ChartConfig }
  | { id: string; type: 'entity_list'; title: string; w: WidgetWidth; config: EntityListConfig };

export interface DashboardSummary {
  id: string;
  name: string;
  descriptionHtml: string | null;
  status: DashboardStatus;
  widgetCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard extends DashboardSummary {
  widgets: DashboardWidget[];
}

export interface DashboardList {
  items: DashboardSummary[];
  total: number;
}

export interface EntityCatalogEntry {
  key: EntityKey;
  label: string;
  statuses: { key: string; label: string }[];
  amounts: { key: string; label: string }[];
  groupBy: { key: string; label: string }[];
  sort: { key: string; label: string }[];
}

export interface AggregateResult {
  value: string;
  groups?: { key: string; label: string; value: string }[];
}

export interface DashboardRecord {
  id: string;
  reference: string;
  title: string | null;
  status: string;
  statusLabel: string;
  amount: string | null;
  createdAt: string;
  href: string | null;
}

export interface DashboardRecordList {
  items: DashboardRecord[];
  total: number;
}
