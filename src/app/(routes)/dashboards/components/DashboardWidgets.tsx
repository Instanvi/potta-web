'use client';

import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMetricValue } from '@/lib/dashboards/format';
import type { DashboardWidget } from '@/lib/dashboards/types';
import { EmptyState, ErrorState, LoadingState, StatCard } from '../../_shared/states';
import { useAggregate, useDashboardRecords } from '../hooks';

const colSpan: Record<number, string> = {
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  6: 'md:col-span-6',
  8: 'md:col-span-8',
  12: 'md:col-span-12',
};

const CHART_COLORS = ['hsl(var(--primary))', '#64748b', '#0f766e', '#b45309', '#7c3aed', '#be123c'];

function KpiWidget({ widget }: { widget: Extract<DashboardWidget, { type: 'kpi' }> }) {
  const { data, isLoading, error, refetch } = useAggregate(widget.config.entity, {
    aggregation: widget.config.aggregation,
    field: widget.config.field,
    status: widget.config.statuses,
    fromDate: widget.config.fromDate,
    toDate: widget.config.toDate,
  });
  if (isLoading) return <LoadingState label="Loading metric…" />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  return (
    <StatCard
      label={widget.title}
      value={formatMetricValue(data?.value, widget.config.format)}
    />
  );
}

function ChartWidget({ widget }: { widget: Extract<DashboardWidget, { type: 'chart' }> }) {
  const { data, isLoading, error, refetch } = useAggregate(widget.config.entity, {
    aggregation: widget.config.aggregation,
    field: widget.config.field,
    status: widget.config.statuses,
    groupBy: widget.config.groupBy,
    limit: widget.config.limit,
    fromDate: widget.config.fromDate,
    toDate: widget.config.toDate,
  });
  if (isLoading) return <LoadingState label="Loading chart…" />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  const groups = data?.groups ?? [];
  const chartData = groups.map((g) => ({
    name: g.label || g.key || '—',
    value: Number(g.value) || 0,
  }));
  const chartType = widget.config.chartType ?? 'bar';
  const formatTip = (v: number | string) => formatMetricValue(v, widget.config.format);

  return (
    <div className="dashboard-panel p-4">
      <p className="text-xs text-muted-foreground">{widget.title}</p>
      {chartData.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No data for this period.</p>
      ) : chartType === 'donut' ? (
        <div className="mt-2 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatTip(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : chartType === 'horizontal_bar' ? (
        <div className="mt-2 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatTip(v)} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-2 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatTip(v)} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function EntityListWidget({ widget }: { widget: Extract<DashboardWidget, { type: 'entity_list' }> }) {
  const { data, isLoading, error, refetch } = useDashboardRecords(widget.config.entity, {
    sort: widget.config.sort,
    order: widget.config.order,
    limit: widget.config.pageSize,
  });
  if (isLoading) return <LoadingState label="Loading list…" />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  const items = data?.items ?? [];

  return (
    <div className="dashboard-panel p-4">
      <p className="text-xs text-muted-foreground">{widget.title}</p>
      {items.length === 0 ? (
        <EmptyState title="No records" description="Nothing to show for this list yet." variant="plain" />
      ) : (
        <ul className="mt-3 divide-y divide-black/[0.06]">
          {items.map((row) => {
            const content = (
              <div className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.reference || row.title || '—'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.title && row.reference ? row.title : row.statusLabel}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {row.amount != null && (
                    <p className="tabular-nums font-medium">{formatMetricValue(row.amount, { decimals: 0, scale: 'none', currency: 'XAF' })}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{row.statusLabel}</p>
                </div>
              </div>
            );
            return (
              <li key={row.id}>
                {row.href ? (
                  <Link href={row.href} className="block hover:bg-brand-subtle/60">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DashboardGrid({
  widgets,
  onRemove,
}: {
  widgets: DashboardWidget[];
  onRemove?: (id: string) => void;
}) {
  if (!widgets.length) {
    return (
      <EmptyState
        title="No widgets"
        description="Use Add widget to open the sheet and pick from dozens of ready KPIs, charts, or lists."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      {widgets.map((widget) => (
        <div key={widget.id} className={`relative col-span-1 ${colSpan[widget.w] ?? 'md:col-span-4'}`}>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(widget.id)}
              className="absolute right-2 top-2 z-10 rounded-[2px] bg-white/90 px-2 py-0.5 text-xs text-destructive shadow-sm"
            >
              Remove
            </button>
          )}
          {widget.type === 'kpi' && <KpiWidget widget={widget} />}
          {widget.type === 'chart' && <ChartWidget widget={widget} />}
          {widget.type === 'entity_list' && <EntityListWidget widget={widget} />}
        </div>
      ))}
    </div>
  );
}
