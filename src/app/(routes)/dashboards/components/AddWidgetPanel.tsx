'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_FORMAT, MONEY_FORMAT } from '@/lib/dashboards/format';
import type { DashboardWidget, EntityCatalogEntry, EntityKey, WidgetWidth } from '@/lib/dashboards/types';
import { Button } from '@/components/shadcn/button';

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AddWidgetPanel({
  catalog,
  onAdd,
}: {
  catalog: EntityCatalogEntry[];
  onAdd: (widget: DashboardWidget) => void;
}) {
  const [type, setType] = useState<'kpi' | 'chart' | 'entity_list'>('kpi');
  const [entity, setEntity] = useState<EntityKey>(catalog[0]?.key ?? 'invoices');
  const [title, setTitle] = useState('New metric');
  const [aggregation, setAggregation] = useState<'count' | 'sum'>('count');
  const [field, setField] = useState<string>('');
  const [w, setW] = useState<WidgetWidth>(4);

  const selected = useMemo(() => catalog.find((c) => c.key === entity), [catalog, entity]);

  const add = () => {
    if (!selected) return;
    if (type === 'kpi') {
      onAdd({
        id: newId('kpi'),
        type: 'kpi',
        title: title.trim() || selected.label,
        w,
        config: {
          entity,
          aggregation,
          field: aggregation === 'count' ? null : field || selected.amounts[0]?.key || null,
          statuses: [],
          format: aggregation === 'count' ? DEFAULT_FORMAT : MONEY_FORMAT,
        },
      });
      return;
    }
    if (type === 'chart') {
      onAdd({
        id: newId('chart'),
        type: 'chart',
        title: title.trim() || `${selected.label} chart`,
        w: w < 6 ? 8 : w,
        config: {
          entity,
          aggregation,
          field: aggregation === 'count' ? null : field || selected.amounts[0]?.key || null,
          statuses: [],
          format: DEFAULT_FORMAT,
          chartType: 'bar',
          groupBy: selected.groupBy[0]?.key ?? 'status',
          limit: 10,
        },
      });
      return;
    }
    onAdd({
      id: newId('list'),
      type: 'entity_list',
      title: title.trim() || `Recent ${selected.label.toLowerCase()}`,
      w: 12,
      config: {
        entity,
        sort: 'createdAt',
        order: 'desc',
        pageSize: 5,
        searchable: false,
      },
    });
  };

  if (!catalog.length) {
    return <p className="text-sm text-muted-foreground">No entities available for your permissions.</p>;
  }

  return (
    <div className="dashboard-panel flex flex-col gap-3 p-4">
      <p className="text-sm font-medium">Add widget</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs">
          Type
          <select
            className="mt-1 w-full rounded-[2px] border border-black/10 bg-white px-2 py-1.5 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
          >
            <option value="kpi">KPI</option>
            <option value="chart">Chart</option>
            <option value="entity_list">List</option>
          </select>
        </label>
        <label className="text-xs">
          Entity
          <select
            className="mt-1 w-full rounded-[2px] border border-black/10 bg-white px-2 py-1.5 text-sm"
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityKey)}
          >
            {catalog.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          Title
          <input
            className="mt-1 w-full rounded-[2px] border border-black/10 bg-white px-2 py-1.5 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        {type !== 'entity_list' && (
          <label className="text-xs">
            Aggregation
            <select
              className="mt-1 w-full rounded-[2px] border border-black/10 bg-white px-2 py-1.5 text-sm"
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as 'count' | 'sum')}
            >
              <option value="count">Count</option>
              <option value="sum" disabled={!selected?.amounts.length}>
                Sum
              </option>
            </select>
          </label>
        )}
        {type !== 'entity_list' && aggregation !== 'count' && (
          <label className="text-xs">
            Amount field
            <select
              className="mt-1 w-full rounded-[2px] border border-black/10 bg-white px-2 py-1.5 text-sm"
              value={field || selected?.amounts[0]?.key || ''}
              onChange={(e) => setField(e.target.value)}
            >
              {(selected?.amounts ?? []).map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="text-xs">
          Width
          <select
            className="mt-1 w-full rounded-[2px] border border-black/10 bg-white px-2 py-1.5 text-sm"
            value={w}
            onChange={(e) => setW(Number(e.target.value) as WidgetWidth)}
          >
            {[3, 4, 6, 8, 12].map((n) => (
              <option key={n} value={n}>
                {n}/12
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <Button type="button" size="sm" onClick={add}>
          Add to layout
        </Button>
      </div>
    </div>
  );
}
