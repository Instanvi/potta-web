import type { ChartType, ColorPalette } from './types';

export const CHART_TYPE_OPTIONS: {
  value: ChartType;
  label: string;
  blurb: string;
}[] = [
  { value: 'bar', label: 'Bar', blurb: 'Compare categories side by side' },
  { value: 'horizontal_bar', label: 'Horizontal', blurb: 'Great for long labels' },
  { value: 'stacked_bar', label: 'Stacked', blurb: 'Colorful category bars' },
  { value: 'line', label: 'Line', blurb: 'Trends across groups' },
  { value: 'area', label: 'Area', blurb: 'Volume under the curve' },
  { value: 'composed', label: 'Combo', blurb: 'Bars with a trend line' },
  { value: 'pie', label: 'Pie', blurb: 'Share of the whole' },
  { value: 'donut', label: 'Donut', blurb: 'Share with a center focus' },
  { value: 'radar', label: 'Radar', blurb: 'Shape across dimensions' },
  { value: 'radial', label: 'Radial', blurb: 'Progress-style arcs' },
  { value: 'table', label: 'Table', blurb: 'Exact numbers in rows' },
];

export const COLOR_PALETTE_OPTIONS: {
  value: ColorPalette;
  label: string;
  swatches: string[];
}[] = [
  {
    value: 'brand',
    label: 'Brand',
    swatches: ['hsl(var(--primary))', '#0f766e', '#64748b', '#b45309', '#7c3aed', '#be123c'],
  },
  {
    value: 'ocean',
    label: 'Ocean',
    swatches: ['#0ea5e9', '#0284c7', '#0369a1', '#14b8a6', '#0f766e', '#155e75'],
  },
  {
    value: 'sunset',
    label: 'Sunset',
    swatches: ['#f97316', '#ea580c', '#dc2626', '#eab308', '#fb7185', '#c2410c'],
  },
  {
    value: 'forest',
    label: 'Forest',
    swatches: ['#16a34a', '#15803d', '#65a30d', '#0d9488', '#4d7c0f', '#166534'],
  },
  {
    value: 'mono',
    label: 'Mono',
    swatches: ['#111827', '#374151', '#6b7280', '#9ca3af', '#4b5563', '#1f2937'],
  },
];

export function paletteColors(palette: ColorPalette | undefined): string[] {
  return (
    COLOR_PALETTE_OPTIONS.find((p) => p.value === (palette ?? 'brand'))?.swatches ??
    COLOR_PALETTE_OPTIONS[0].swatches
  );
}
