import { Skeleton } from '@/components/ui/loaders';

/** Matches `StatCard size="lg"` so the grid doesn't shift when the metric arrives. */
export function KpiWidgetSkeleton() {
  return (
    <div className="dashboard-panel h-full min-h-[132px] px-6 py-5" role="status" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-8 w-32" />
      <span className="sr-only">Loading metric…</span>
    </div>
  );
}

export function ListWidgetSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="dashboard-panel h-full px-6 py-5" role="status" aria-busy="true">
      <Skeleton className="h-4 w-36" />
      <ul className="mt-4 divide-y divide-black/[0.06]">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3.5 w-16" />
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading list…</span>
    </div>
  );
}

export function ChartWidgetSkeleton() {
  return (
    <div className="dashboard-panel flex h-full min-h-[320px] flex-col px-6 py-5" role="status" aria-busy="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-8 w-28" />
      <div className="mt-6 flex flex-1 items-end gap-3">
        {[55, 80, 40, 95, 65, 75].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%`, minHeight: 24 }} />
        ))}
      </div>
      <span className="sr-only">Loading chart…</span>
    </div>
  );
}
