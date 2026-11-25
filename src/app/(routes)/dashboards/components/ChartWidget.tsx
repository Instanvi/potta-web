'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { paletteColors } from '@/lib/dashboards/chart-types';
import { formatMetricValue } from '@/lib/dashboards/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import type { DashboardWidget } from '@/lib/dashboards/types';
import { ErrorState } from '../../_shared/states';
import { ChartWidgetSkeleton } from './WidgetSkeletons';
import { useAggregate } from '../hooks';

type ChartWidgetProps = {
  widget: Extract<DashboardWidget, { type: 'chart' }>;
  onChartTypeChange?: (chartType: Extract<DashboardWidget, { type: 'chart' }>['config']['chartType']) => void;
};

export function ChartWidget({ widget, onChartTypeChange }: ChartWidgetProps) {
  const { data, isLoading, error, refetch } = useAggregate(widget.config.entity, {
    aggregation: widget.config.aggregation,
    field: widget.config.field,
    status: widget.config.statuses,
    groupBy: widget.config.groupBy,
    limit: widget.config.limit,
    fromDate: widget.config.fromDate,
    toDate: widget.config.toDate,
  });

  if (isLoading) return <ChartWidgetSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;

  const colors = paletteColors(widget.config.colorPalette);
  const groups = data?.groups ?? [];
  const chartData = groups.map((g, i) => ({
    name: g.label || g.key || '—',
    value: Number(g.value) || 0,
    fill: colors[i % colors.length],
  }));
  const chartType = widget.config.chartType ?? 'bar';
  const showLegend = widget.config.showLegend !== false;
  const showGrid = widget.config.showGrid !== false;
  const total = chartData.reduce((s, r) => s + r.value, 0);
  const formatTip = (v: number | string) => formatMetricValue(v, widget.config.format);
  const tip = {
    formatter: ((v: number | string) => [formatTip(v), 'Value']) as never,
    contentStyle: { borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13 },
  };

  return (
    <div className="dashboard-panel flex h-full min-h-[320px] flex-col px-6 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{widget.title}</p>
          <p className="mt-2 text-[1.75rem] font-medium tabular-nums leading-none tracking-tight sm:text-[2rem]">
            {formatMetricValue(total, widget.config.format)}
          </p>
        </div>
        {onChartTypeChange ? (
          <Select
            value={chartType}
            onValueChange={(v) => onChartTypeChange(v as typeof chartType)}
          >
            <SelectTrigger
              aria-label="Chart type"
              className="h-auto w-auto min-w-[8rem] gap-2 px-2.5 py-1.5 text-sm text-muted-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="horizontal_bar">Horizontal</SelectItem>
              <SelectItem value="stacked_bar">Stacked</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="composed">Combo</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
              <SelectItem value="donut">Donut</SelectItem>
              <SelectItem value="radar">Radar</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
              <SelectItem value="table">Table</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="rounded-[2px] bg-muted px-2.5 py-1 text-xs font-normal uppercase tracking-wide text-muted-foreground">
            {chartType.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {chartData.length === 0 ? (
        <p className="mt-10 text-center text-[15px] text-muted-foreground">
          No data for this period. Try another range or group.
        </p>
      ) : chartType === 'table' ? (
        <div className="mt-4 max-h-[280px] overflow-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-black/10 text-sm text-muted-foreground">
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 text-right font-medium">Value</th>
                <th className="py-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.name} className="border-b border-black/[0.04]">
                  <td className="flex items-center gap-2 py-2.5">
                    <span
                      className="inline-block size-2.5 shrink-0 rounded-[2px]"
                      style={{ background: row.fill }}
                    />
                    {row.name}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{formatTip(row.value)}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                    {total ? `${Math.round((row.value / total) * 100)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 h-[260px] w-full min-h-[220px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' || chartType === 'donut' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={chartType === 'donut' ? 68 : 0}
                  outerRadius={102}
                  paddingAngle={2}
                >
                  {chartData.map((row, i) => (
                    <Cell key={row.name} fill={row.fill ?? colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
              </PieChart>
            ) : chartType === 'radar' ? (
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fontSize: 12 }} />
                <Radar
                  dataKey="value"
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.35}
                />
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
              </RadarChart>
            ) : chartType === 'radial' ? (
              <RadialBarChart
                data={chartData}
                innerRadius="20%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" background cornerRadius={2}>
                  {chartData.map((row, i) => (
                    <Cell key={row.name} fill={row.fill ?? colors[i % colors.length]} />
                  ))}
                </RadialBar>
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
              </RadialBarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                {showGrid ? <CartesianGrid strokeDasharray="3 3" vertical={false} /> : null}
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: colors[0] }}
                />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                {showGrid ? <CartesianGrid strokeDasharray="3 3" vertical={false} /> : null}
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors[0]}
                  fill={colors[1] ?? colors[0]}
                  fillOpacity={0.25}
                />
              </AreaChart>
            ) : chartType === 'composed' ? (
              <ComposedChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                {showGrid ? <CartesianGrid strokeDasharray="3 3" vertical={false} /> : null}
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
                <Bar dataKey="value" name="Value" radius={[2, 2, 0, 0]}>
                  {chartData.map((row, i) => (
                    <Cell key={row.name} fill={row.fill ?? colors[i % colors.length]} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Trend"
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            ) : chartType === 'horizontal_bar' ? (
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8, top: 8 }}>
                {showGrid ? <CartesianGrid strokeDasharray="3 3" horizontal={false} /> : null}
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 12 }} />
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
                <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                  {chartData.map((row, i) => (
                    <Cell key={row.name} fill={row.fill ?? colors[i % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                {showGrid ? <CartesianGrid strokeDasharray="3 3" vertical={false} /> : null}
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip {...tip} />
                {showLegend ? <Legend wrapperStyle={{ fontSize: 13 }} /> : null}
                <Bar
                  dataKey="value"
                  radius={[2, 2, 0, 0]}
                  stackId={chartType === 'stacked_bar' ? 'a' : undefined}
                >
                  {chartData.map((row, i) => (
                    <Cell key={row.name} fill={row.fill ?? colors[i % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
