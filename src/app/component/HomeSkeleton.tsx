import { Skeleton } from '@potta/components/ui/loaders';

/** Placeholder with the home screen's layout: greeting and control cards. */
export function HomeSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-5">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="dashboard-panel flex flex-col gap-4 p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-[2px]" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3.5 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-[2px]" />
              <Skeleton className="h-7 w-20 rounded-[2px]" />
              <Skeleton className="h-7 w-20 rounded-[2px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
