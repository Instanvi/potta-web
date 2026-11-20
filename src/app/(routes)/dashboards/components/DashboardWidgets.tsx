'use client';

import Link from 'next/link';
import { formatMetricValue } from '@/lib/dashboards/format';
import type { ChartType, DashboardWidget } from '@/lib/dashboards/types';
import { EmptyState, ErrorState, LoadingState, StatCard } from '../../_shared/states';
import { useAggregate, useDashboardRecords } from '../hooks';
import { ChartWidget } from './ChartWidget';

const colSpan: Record<number, string> = {
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  6: 'md:col-span-6',
  8: 'md:col-span-8',
  12: 'md:col-span-12',
};

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
  onUpdateWidget,
}: {
  widgets: DashboardWidget[];
  onRemove?: (id: string) => void;
  onUpdateWidget?: (id: string, next: DashboardWidget) => void;
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
          {widget.type === 'chart' && (
            <ChartWidget
              widget={widget}
              onChartTypeChange={
                onUpdateWidget
                  ? (chartType: ChartType) =>
                      onUpdateWidget(widget.id, {
                        ...widget,
                        config: { ...widget.config, chartType },
                      })
                  : undefined
              }
            />
          )}
          {widget.type === 'entity_list' && <EntityListWidget widget={widget} />}
        </div>
      ))}
    </div>
  );
}
