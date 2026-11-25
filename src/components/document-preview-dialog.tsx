'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import { DocumentPreviewShell } from '@potta/components/document-master-detail';
import { cn } from '@potta/lib/utils';

/** Full-page document preview sheet (not a side slide-over). */
export function DocumentPreviewDialog({
  open,
  onOpenChange,
  title = 'Preview',
  downloadTitle,
  onDownloadPdf,
  dialogTitle,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  downloadTitle?: string;
  onDownloadPdf?: () => void | Promise<void>;
  dialogTitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex h-[min(96vh,1000px)] w-[min(98vw,1100px)] max-w-none flex-col gap-0 overflow-hidden rounded-[2px] p-0 [&>button]:hidden',
          className,
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{dialogTitle ?? title}</DialogTitle>
        </DialogHeader>
        <DocumentPreviewShell
          title={title}
          downloadTitle={downloadTitle}
          onClose={() => onOpenChange(false)}
          onDownloadPdf={onDownloadPdf}
          className="h-full min-h-0"
        >
          {children}
        </DocumentPreviewShell>
      </DialogContent>
    </Dialog>
  );
}
