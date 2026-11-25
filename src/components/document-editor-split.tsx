'use client';

import { ReactNode, useCallback, useRef } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { DocumentPreviewShell } from '@potta/components/document-master-detail';
import { cn } from '@potta/lib/utils';

/**
 * Keeps the latest PDF download in a ref.
 * Storing it in state re-renders the editor, which rebuilds the callback and
 * registers it again until React hits the maximum update depth.
 */
export function usePreviewDownload() {
  const downloadRef = useRef<(() => Promise<void>) | null>(null);
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    downloadRef.current = fn;
  }, []);
  const onDownloadPdf = useCallback(async () => {
    await downloadRef.current?.();
  }, []);
  return { registerDownload, onDownloadPdf };
}

/** Header control that shows or hides the side-by-side document preview. */
export function DocumentPreviewToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[2px] border border-black/10 bg-white px-3 text-sm text-foreground hover:bg-accent"
    >
      <i className={open ? 'ri-eye-off-line' : 'ri-eye-line'} />
      {open ? 'Hide preview' : 'Show preview'}
    </button>
  );
}

/**
 * Editor and live preview side by side, with a drag handle between them.
 * Remounts when the preview opens or closes so panel sizes reset.
 */
export function DocumentEditorSplit({
  open,
  onOpenChange,
  editor,
  preview,
  downloadTitle,
  onDownloadPdf,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: ReactNode;
  preview: ReactNode;
  downloadTitle?: string;
  onDownloadPdf?: () => void | Promise<void>;
  className?: string;
}) {
  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col bg-white', className)}>
      <ResizablePanelGroup
        key={open ? 'with-preview' : 'editor-only'}
        direction="horizontal"
        className="min-h-0 flex-1 space-x-0"
      >
        <ResizablePanel
          minSize={open ? 36 : 100}
          defaultSize={open ? 58 : 100}
          className="min-w-0"
        >
          <div className="h-full min-h-0 overflow-y-auto bg-white">{editor}</div>
        </ResizablePanel>
        {open ? (
          <>
            <ResizableHandle withHandle className="bg-transparent" />
            <ResizablePanel minSize={24} defaultSize={42} className="min-w-0">
              <div className="h-full min-h-0 overflow-hidden border-l border-black/[0.06] bg-white">
                <DocumentPreviewShell
                  title="Preview"
                  downloadTitle={downloadTitle}
                  onClose={() => onOpenChange(false)}
                  onDownloadPdf={onDownloadPdf}
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
