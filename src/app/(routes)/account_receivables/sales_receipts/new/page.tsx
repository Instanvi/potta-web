'use client';
import React, { useCallback, useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState<(() => Promise<void>) | null>(
    null,
  );
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    setDownloadPdf(() => fn);
  }, []);

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  return (
    <DocumentWorkspace
      title="Sales receipt"
      closeHref="/account_receivables/sales_receipts"
      headerActions={
        <>
          <LocationSwitcher />
          <button
            type="button"
            onClick={openPreview}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[2px] border border-black/10 bg-white px-3 text-sm text-foreground hover:bg-accent"
          >
            <i className="ri-eye-line" />
            Preview
          </button>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col bg-main-bg">
        <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-main-bg">
          <Left onOpenPreview={openPreview} />
        </div>
      </div>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={(open) => !open && closePreview()}
        downloadTitle="Sales receipt"
        dialogTitle="Sales receipt preview"
        onDownloadPdf={downloadPdf ?? undefined}
      >
        <PdfView onRegisterDownload={registerDownload} />
      </DocumentPreviewDialog>
    </DocumentWorkspace>
  );
};

export default NewSalesReciept;
