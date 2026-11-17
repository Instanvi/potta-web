'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Talk-style main card: white surface, soft shadow, title + description header. */
export function PanelCard({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-card"
      className={cn(
        'flex flex-col rounded-md bg-white text-card-foreground shadow-card transition-all',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelCardHeader({
  className,
  title,
  description,
  action,
  children,
}: {
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-neutral-50 p-6',
        className,
      )}
    >
      {children ?? (
        <>
          <div className="min-w-0">
            {title ? (
              <h3 className="text-lg font-medium text-black">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-black/70">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </>
      )}
    </div>
  );
}

export function PanelCardContent({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}
