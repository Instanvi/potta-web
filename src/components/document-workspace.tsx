'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@potta/lib/utils';
import { INSTANVI_ICON_SVG, POTTA_LOGO_SVG } from '@/lib/brand';

/**
 * Full-viewport document create/edit chrome (no app sidebar).
 * Matches Pay / QuickBooks-style invoice: title, close, scroll body, sticky footer.
 */
export function DocumentWorkspace({
  title,
  description,
  onClose,
  closeHref,
  children,
  footer,
  headerActions,
  className,
  bodyClassName,
}: {
  title: string;
  description?: ReactNode;
  onClose?: () => void;
  /** Prefer this over onClose when navigating back to a list route. */
  closeHref?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const router = useRouter();
  const close = () => {
    if (onClose) onClose();
    else if (closeHref) router.push(closeHref);
    else router.back();
  };

  return (
    <div className={cn('fixed inset-0 z-[100] flex flex-col bg-main-bg', className)}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-white px-3 py-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden items-center gap-2 border-r border-black/10 pr-3 sm:flex">
            <Image
              src={POTTA_LOGO_SVG}
              alt="Potta"
              width={72}
              height={24}
              className="h-6 w-auto object-contain"
              priority
            />
            <Image
              src={INSTANVI_ICON_SVG}
              alt="Instanvi"
              width={22}
              height={22}
              className="h-5 w-5 object-contain opacity-80"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-medium text-foreground sm:text-lg">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerActions}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="inline-flex size-9 items-center justify-center rounded-[2px] text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>
      </header>
      <div className={cn('min-h-0 flex-1 overflow-y-auto bg-main-bg', bodyClassName)}>
        {children}
      </div>
      {footer != null && (
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-3 md:px-6">
          {footer}
        </footer>
      )}
    </div>
  );
}

export default DocumentWorkspace;
