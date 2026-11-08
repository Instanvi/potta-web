import * as React from 'react';
import { cn } from '@potta/lib/utils';

/** Small circular ring spinner in the brand green (same as the hub and Pay). */
export function AppSpinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('shrink-0 animate-spin text-[var(--brand)]', className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Route / full-page loader (loading.tsx, auth handoff, guarded pages). */
export function PageLoader({
  className,
  compact = false,
  label = 'Loading…',
  message,
}: {
  className?: string;
  /** Shorter block for loaders inside a page section. */
  compact?: boolean;
  label?: string;
  /** Visible caption under the spinner. */
  message?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex w-full flex-col items-center justify-center gap-3',
        compact ? 'min-h-[40vh] py-16' : 'min-h-screen bg-white',
        className,
      )}
    >
      <AppSpinner size={compact ? 28 : 36} />
      {message ? <p className="text-sm text-black/60">{message}</p> : <span className="sr-only">{label}</span>}
    </div>
  );
}

/** Inline spinner + text, for sections and buttons. */
export function InlineLoader({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex items-center justify-center gap-3 py-16 text-sm text-black/60', className)}>
      <AppSpinner size={20} />
      {label}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('animate-pulse rounded-[2px] bg-gray-200/80', className)} {...props} />;
}

/** Table placeholder: header band plus rows with uneven cell widths so it reads as data. */
export function TableSkeleton({
  rows = 8,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/12', 'w-1/3', 'w-7/12'];
  return (
    <div aria-busy="true" className={cn('overflow-hidden border border-black/10 bg-white', className)}>
      <div className="flex items-center gap-6 border-b border-black/10 bg-[#ecf8f4] px-4 py-3">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-3 flex-1 bg-black/10" />
        ))}
      </div>
      <div className="divide-y divide-black/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="flex-1">
                <Skeleton className={cn('h-3.5', widths[(r + c) % widths.length])} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** List / feed placeholder (notifications, history). */
export function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div aria-busy="true" className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
