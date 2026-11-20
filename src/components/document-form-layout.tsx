'use client';

import { ReactNode } from 'react';
import { cn } from '@potta/lib/utils';

/** QuickBooks-inspired document canvas used by Invoice and Bill create screens. */
export function DocumentFormShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('mx-auto flex w-full max-w-6xl flex-col pb-28', className)}>
      <div className="rounded-[2px] border border-black/[0.08] bg-white shadow-sm">{children}</div>
    </div>
  );
}

/** Sticky dark footer: Cancel | center links | Save / Save and send. */
export function DocumentFormFooter({
  left,
  center,
  right,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/30 bg-[#1f2937] px-4 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">{left}</div>
        {center ? (
          <div className="order-last flex w-full flex-wrap items-center justify-center gap-4 md:order-none md:w-auto">
            {center}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">{right}</div>
      </div>
    </div>
  );
}

export function DocumentFormCard({
  className,
  children,
  flush,
}: {
  className?: string;
  children: ReactNode;
  /** Drop outer card chrome when nested inside the white document sheet. */
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        flush
          ? 'border-b border-black/[0.06] px-5 py-5 last:border-b-0 md:px-8 md:py-6'
          : 'rounded-[2px] border border-black/[0.08] bg-white p-5 shadow-sm md:p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DocumentBalanceDue({
  label = 'Balance due',
  amount,
}: {
  label?: string;
  amount: ReactNode;
}) {
  return (
    <div className="text-right">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">{label}</p>
      <p className="mt-1 text-3xl font-medium tabular-nums text-foreground">{amount}</p>
    </div>
  );
}

export function DocumentSectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-sm font-medium text-foreground">{children}</h3>;
}

export function DocumentFooterLink({
  children,
  onClick,
  href,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    'text-sm font-medium text-white/85 underline-offset-2 hover:text-white hover:underline';
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
