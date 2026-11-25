'use client';
import React, { useCallback, useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';
import { DataProvider } from '@potta/components/providers/DataProvider';

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState<(() => Promise<void>) | null>(null);
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    setDownloadPdf(() => fn);
  }, []);
  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  // Own provider: this form keeps its state in `data`, which would otherwise clobber the till's cart.
  return (
    <DocumentWorkspace
      title="New Sale"
      closeHref="/pos/sales"
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
      <DataProvider>
        <div className="flex h-full min-h-0 justify-center overflow-y-auto bg-main-bg p-4 md:p-5">
          <Left />
        </div>

        <DocumentPreviewDialog
          open={showPreview}
          onOpenChange={(open) => !open && closePreview()}
          downloadTitle="Sale receipt"
          dialogTitle="Sale preview"
          onDownloadPdf={downloadPdf ?? undefined}
        >
          <PdfView onRegisterDownload={registerDownload} />
        </DocumentPreviewDialog>
      </DataProvider>
    </DocumentWorkspace>
  );
};

export default NewSalesReciept;
