'use client';

import { useMemo, useState } from 'react';
import { CHART_TYPE_OPTIONS, COLOR_PALETTE_OPTIONS } from '@/lib/dashboards/chart-types';
import { DATE_PRESET_OPTIONS, resolveDatePreset } from '@/lib/dashboards/date-range';
import { DEFAULT_FORMAT, MONEY_FORMAT } from '@/lib/dashboards/format';
import { KPI_PRESETS } from '@/lib/dashboards/kpi-presets';
import type {
  Aggregation,
  ChartType,
  ColorPalette,
  DashboardWidget,
  DatePreset,
  EntityCatalogEntry,
  EntityKey,
  WidgetWidth,
} from '@/lib/dashboards/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shadcn/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const fieldClass =
  'mt-1 w-full rounded-[2px] border border-black/10 bg-field px-2 py-1.5 text-sm';

export function AddWidgetPanel({
  catalog,
  onAdd,
  open,
  onOpenChange,
}: {
  catalog: EntityCatalogEntry[];
  onAdd: (widget: DashboardWidget) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = useState<'kpi' | 'chart' | 'entity_list'>('kpi');
  const [entity, setEntity] = useState<EntityKey>(catalog[0]?.key ?? 'invoices');
  const [title, setTitle] = useState('New metric');
  const [aggregation, setAggregation] = useState<Aggregation>('count');
  const [field, setField] = useState<string>('');
  const [w, setW] = useState<WidgetWidth>(4);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [groupBy, setGroupBy] = useState<string>('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [presetFilter, setPresetFilter] = useState('');
  const [colorPalette, setColorPalette] = useState<ColorPalette>('brand');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [limit, setLimit] = useState(10);

  const selected = useMemo(() => catalog.find((c) => c.key === entity), [catalog, entity]);
  const catalogKeys = useMemo(() => new Set(catalog.map((c) => c.key)), [catalog]);

  const presets = useMemo(() => {
    const q = presetFilter.trim().toLowerCase();
    return KPI_PRESETS.filter((p) => catalogKeys.has(p.entity)).filter(
      (p) => !q || p.label.toLowerCase().includes(q) || p.group.toLowerCase().includes(q),
    );
  }, [catalogKeys, presetFilter]);

  const presetGroups = useMemo(() => {
    const map = new Map<string, typeof presets>();
    for (const p of presets) {
      const list = map.get(p.group) ?? [];
      list.push(p);
      map.set(p.group, list);
    }
    return [...map.entries()];
  }, [presets]);

  const resetForm = () => {
    setType('kpi');
    setTitle('New metric');
    setAggregation('count');
    setField('');
    setStatuses([]);
    setChartType('bar');
    setDatePreset('all');
    setColorPalette('brand');
    setShowLegend(true);
    setShowGrid(true);
    setLimit(10);
    setW(4);
  };

  const addCustom = () => {
    if (!selected) return;
    const range = resolveDatePreset(datePreset);
    const format = aggregation === 'count' ? DEFAULT_FORMAT : MONEY_FORMAT;
    const measureField = aggregation === 'count' ? null : field || selected.amounts[0]?.key || null;

    if (type === 'kpi') {
      onAdd({
        id: newId('kpi'),
        type: 'kpi',
        title: title.trim() || selected.label,
        w,
        config: {
          entity,
          aggregation,
          field: measureField,
          statuses,
          format,
          fromDate: range.fromDate ?? null,
          toDate: range.toDate ?? null,
        },
      });
    } else if (type === 'chart') {
      onAdd({
        id: newId('chart'),
        type: 'chart',
        title: title.trim() || `${selected.label} chart`,
        w: w < 6 ? 6 : w,
        config: {
          entity,
          aggregation,
          field: measureField,
          statuses,
          format,
          fromDate: range.fromDate ?? null,
          toDate: range.toDate ?? null,
          chartType,
          groupBy: groupBy || selected.groupBy[0]?.key || 'status',
          limit,
          showLegend,
          showGrid,
          colorPalette,
        },
      });
    } else {
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
    }
    resetForm();
    onOpenChange(false);
  };

  const toggleStatus = (key: string) => {
    setStatuses((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  if (!catalog.length) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 overflow-hidden p-0">
        <SheetHeader className="border-b border-black/5 px-6 py-4">
          <SheetTitle>Add widget</SheetTitle>
          <SheetDescription>
            Pick a ready KPI or build a custom metric from any books entity.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm font-medium">Quick KPIs</p>
              <input
                className={`${fieldClass} max-w-[180px]`}
                placeholder="Filter presets"
                value={presetFilter}
                onChange={(e) => setPresetFilter(e.target.value)}
              />
            </div>
            {presetGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No presets match your permissions.</p>
            ) : (
              presetGroups.map(([group, items]) => (
                <div key={group} className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((preset) => (
                      <Button
                        key={preset.id}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const range = resolveDatePreset(datePreset);
                          const widget = preset.build();
                          if (widget.type !== 'entity_list') {
                            widget.config = {
                              ...widget.config,
                              fromDate: range.fromDate ?? null,
                              toDate: range.toDate ?? null,
                            };
                          }
                          onAdd(widget);
                          onOpenChange(false);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="space-y-3 border-t border-black/5 pt-4">
            <p className="text-sm font-medium">Custom widget</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs">
                Type
                <select
                  className={fieldClass}
                  value={type}
                  onChange={(e) => {
                    const next = e.target.value as typeof type;
                    setType(next);
                    if (next === 'chart' && w < 6) setW(6);
                    if (next === 'entity_list') setW(12);
                  }}
                >
                  <option value="kpi">KPI</option>
                  <option value="chart">Chart</option>
                  <option value="entity_list">List</option>
                </select>
              </label>
              <label className="text-xs">
                Entity
                <select
                  className={fieldClass}
                  value={entity}
                  onChange={(e) => {
                    const next = e.target.value as EntityKey;
                    setEntity(next);
                    setField('');
                    setStatuses([]);
                    const entry = catalog.find((c) => c.key === next);
                    setGroupBy(entry?.groupBy[0]?.key ?? '');
                  }}
                >
                  {catalog.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs sm:col-span-2">
                Title
                <input
                  className={fieldClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              {type !== 'entity_list' && (
                <>
                  <label className="text-xs">
                    Aggregation
                    <select
                      className={fieldClass}
                      value={aggregation}
                      onChange={(e) => setAggregation(e.target.value as Aggregation)}
                    >
                      <option value="count">Count</option>
                      <option value="sum" disabled={!selected?.amounts.length}>
                        Sum
                      </option>
                      <option value="avg" disabled={!selected?.amounts.length}>
                        Average
                      </option>
                      <option value="min" disabled={!selected?.amounts.length}>
                        Min
                      </option>
                      <option value="max" disabled={!selected?.amounts.length}>
                        Max
                      </option>
                    </select>
                  </label>
                  <label className="text-xs">
                    Period
                    <select
                      className={fieldClass}
                      value={datePreset}
                      onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                    >
                      {DATE_PRESET_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {type !== 'entity_list' && aggregation !== 'count' && (
                <label className="text-xs">
                  Amount field
                  <select
                    className={fieldClass}
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
              {type === 'chart' && (
                <>
                  <label className="text-xs">
                    Group by
                    <select
                      className={fieldClass}
                      value={groupBy || selected?.groupBy[0]?.key || ''}
                      onChange={(e) => setGroupBy(e.target.value)}
                    >
                      {(selected?.groupBy ?? []).map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs">
                    Categories
                    <select
                      className={fieldClass}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                    >
                      {[5, 8, 10, 12, 15, 20].map((n) => (
                        <option key={n} value={n}>
                          Top {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              <label className="text-xs">
                Width
                <select
                  className={fieldClass}
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

            {type === 'chart' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium">Chart style</p>
                  <p className="text-[11px] text-muted-foreground">
                    Pick the look that fits your story — you can change it again while editing.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CHART_TYPE_OPTIONS.map((opt) => {
                      const active = chartType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setChartType(opt.value);
                            if (w < 6) setW(6);
                          }}
                          className={cn(
                            'rounded-[2px] border px-2.5 py-2 text-left transition-colors',
                            active
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                              : 'border-black/10 hover:border-black/25 hover:bg-muted/40',
                          )}
                        >
                          <p className="text-xs font-medium">{opt.label}</p>
                          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                            {opt.blurb}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium">Color palette</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COLOR_PALETTE_OPTIONS.map((pal) => {
                      const active = colorPalette === pal.value;
                      return (
                        <button
                          key={pal.value}
                          type="button"
                          onClick={() => setColorPalette(pal.value)}
                          className={cn(
                            'flex items-center gap-2 rounded-[2px] border px-2 py-1.5 text-xs',
                            active
                              ? 'border-primary bg-primary/5'
                              : 'border-black/10 hover:border-black/25',
                          )}
                        >
                          <span className="flex gap-0.5">
                            {pal.swatches.slice(0, 4).map((c) => (
                              <span
                                key={c}
                                className="size-2.5 rounded-[1px]"
                                style={{ background: c }}
                              />
                            ))}
                          </span>
                          {pal.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showLegend}
                      onChange={(e) => setShowLegend(e.target.checked)}
                    />
                    Show legend
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                    />
                    Show grid
                  </label>
                </div>
              </div>
            ) : null}

            {type !== 'entity_list' && (selected?.statuses.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Status filter (optional — leave empty for all)
                </p>
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                  {selected?.statuses.map((s) => {
                    const active = statuses.includes(s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => toggleStatus(s.key)}
                        className={`rounded-[2px] border px-2 py-1 text-xs ${
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-black/10 text-muted-foreground hover:border-black/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <SheetFooter className="border-t border-black/5 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={addCustom}>
            Add to layout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
