'use client';
import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';
import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

const NewPurchaseOrderPage = () => {
  const [showPreview, setShowPreview] = useState(false);
  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  return (
    <DocumentWorkspace
      title="Purchase order"
      closeHref="/account_payables/purchase"
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
      <div className="flex h-full min-h-0 justify-center overflow-y-auto bg-main-bg p-4 pb-8 md:p-5">
        <Left />
      </div>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={(open) => !open && closePreview()}
        downloadTitle="Purchase order"
        dialogTitle="Purchase order preview"
      >
        <PdfView />
      </DocumentPreviewDialog>
    </DocumentWorkspace>
  );
};

export default NewPurchaseOrderPage;
