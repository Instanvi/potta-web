'use client';

import { ReactNode } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@potta/components/resizable';
import { DocumentPreviewShell } from '@potta/components/document-master-detail';
import { cn } from '@potta/lib/utils';

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
