import { Skeleton } from '@potta/components/ui/loaders';

/** Placeholder with the home screen's layout: header, quick actions, notifications, applications. */
export function HomeSkeleton() {
  return (
    <div aria-busy="true" className="space-y-8">
      <div className="mb-10 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-44 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      <div className="space-y-3 border-b border-slate-100 pb-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[58px] w-44 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-stone-200/80">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="divide-y divide-stone-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-6 py-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 rounded-md border border-stone-200/90 p-5">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
