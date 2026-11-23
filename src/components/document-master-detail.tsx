'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { cn } from '@potta/lib/utils';
import { downloadPreviewAsPdf } from '@/lib/print-preview';

export type DocumentMasterDetailProps = {
  /** Scrollable left list panel content. */
  list: ReactNode;
  /**
   * Center panel. Prefer wrapping with `DocumentDetailChrome` for title + toolbar + body.
   * When `selectedId` is empty, `emptyState` is shown instead.
   */
  detail?: ReactNode;
  /** Right preview / PDF slot — hideable on small screens. */
  preview?: ReactNode;
  emptyState?: ReactNode;
  selectedId?: string | null;
  className?: string;
  listDefaultSize?: number;
  detailDefaultSize?: number;
  previewDefaultSize?: number;
  previewLabel?: string;
  /** Filename / print title for Download PDF. */
  previewDownloadTitle?: string;
  /** Optional brand strip above the three columns (flush under app navbar). */
  banner?: ReactNode;
};

/** Zoho-style 3-column master–detail shell (list | detail | preview). Full-bleed under the app shell. */
export function DocumentMasterDetail({
  list,
  detail,
  preview,
  emptyState,
  selectedId,
  className,
  listDefaultSize = 22,
  detailDefaultSize = 43,
  previewDefaultSize = 35,
  previewLabel = 'Preview',
  previewDownloadTitle,
  banner,
}: DocumentMasterDetailProps) {
  const hasSelection = Boolean(selectedId);
  const [previewOpen, setPreviewOpen] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    setPreviewOpen(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPreviewOpen(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const showPreview = Boolean(preview) && previewOpen && hasSelection;

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full flex-col overflow-hidden border-t border-black/[0.06] bg-white',
        className
      )}
    >
      {banner ? (
        <div className="flex h-11 shrink-0 items-center justify-between gap-3 bg-primary px-3 text-primary-foreground md:px-4">
          {banner}
        </div>
      ) : null}

      <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1 space-x-0">
        <ResizablePanel
          defaultSize={listDefaultSize}
          minSize={16}
          maxSize={36}
          className="min-w-[200px]"
        >
          <div className="flex h-full min-h-0 flex-col border-r border-black/[0.06] bg-white">
            {list}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-transparent" />

        <ResizablePanel
          defaultSize={showPreview ? detailDefaultSize : 100 - listDefaultSize}
          minSize={28}
          className="min-w-0"
        >
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
            {hasSelection ? detail : emptyState}
            {preview && hasSelection && !previewOpen ? (
              <div className="pointer-events-none absolute bottom-4 right-4 z-10">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-[2px] border border-black/10 bg-white px-3 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
                >
                  <i className="ri-eye-line text-base text-primary" />
                  {previewLabel}
                </button>
              </div>
            ) : null}
          </div>
        </ResizablePanel>

        {showPreview ? (
          <>
            <ResizableHandle withHandle className="bg-transparent" />
            <ResizablePanel defaultSize={previewDefaultSize} minSize={20} className="min-w-0">
              <div className="h-full min-h-0 overflow-hidden border-l border-black/[0.06] bg-main-bg">
                <DocumentPreviewShell
                  title={previewLabel}
                  downloadTitle={previewDownloadTitle || previewLabel}
                  onClose={() => setPreviewOpen(false)}
                >
                  {preview}
                </DocumentPreviewShell>
              </div>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
    </div>
  );
}

/** Preview column chrome: title, Download PDF, Hide. */
export function DocumentPreviewShell({
  title = 'Preview',
  downloadTitle,
  onClose,
  onDownloadPdf,
  children,
  className,
}: {
  title?: string;
  downloadTitle?: string;
  onClose?: () => void;
  /** When set, used instead of HTML print-to-PDF (e.g. @react-pdf blob download). */
  onDownloadPdf?: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-black/[0.06] bg-white px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-[2px] bg-brand-subtle text-primary">
            <i className="ri-eye-line text-sm" />
          </span>
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (onDownloadPdf) void onDownloadPdf();
              else downloadPreviewAsPdf(contentRef.current, downloadTitle || title);
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-black/10 bg-white px-2.5 text-xs font-medium text-foreground hover:bg-accent"
          >
            <i className="ri-download-2-line text-sm" />
            Download PDF
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-[2px] text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={`Hide ${title}`}
              title={`Hide ${title}`}
            >
              <i className="ri-close-line text-base" />
            </button>
          ) : null}
        </div>
      </div>
      <div
        ref={contentRef}
        data-document-preview
        className="min-h-0 flex-1 overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}

/** Center-column chrome: title row, action toolbar, scrollable body. */
export function DocumentDetailChrome({
  title,
  subtitle,
  toolbar,
  children,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="shrink-0 border-b border-black/[0.06] px-4 py-3 md:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium text-foreground">{title}</h2>
            {subtitle ? (
              <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div>
            ) : null}
          </div>
          {toolbar ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{toolbar}</div>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">{children}</div>
    </div>
  );
}

/** Compact scrollable list shell for the left column. */
export function DocumentListPanel({
  header,
  children,
  footer,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      {header ? (
        <div className="shrink-0 space-y-2 border-b border-black/[0.06] p-3">{header}</div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer ? (
        <div className="shrink-0 border-t border-black/[0.06] p-2">{footer}</div>
      ) : null}
    </div>
  );
}

export function DocumentListRow({
  selected,
  onClick,
  children,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full flex-col gap-0.5 border-b border-black/[0.04] px-3 py-2.5 text-left transition-colors',
        selected ? 'bg-brand-subtle' : 'hover:bg-accent/60',
        className
      )}
    >
      {children}
    </button>
  );
}

export default DocumentMasterDetail;
