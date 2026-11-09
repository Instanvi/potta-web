import { Skeleton } from '@potta/components/ui/loaders';

/** Placeholder with the home screen's layout: greeting and sections of icon tiles. */
export function HomeSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      {[6, 6, 4].map((count, s) => (
        <div key={s} className="flex flex-col gap-2.5">
          <Skeleton className="h-3 w-20" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="dashboard-panel flex aspect-square flex-col items-center justify-center gap-2.5 p-3">
                <Skeleton className="size-11 rounded-[2px]" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
