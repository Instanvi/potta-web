'use client';

import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import DocumentWorkspace from '@potta/components/document-workspace';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';

export default function NewRecurringInvoicePage() {
  const [showPreview, setShowPreview] = useState(false);
  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  return (
    <DocumentWorkspace
      title="New recurring invoice"
      closeHref="/account_receivables/recurring"
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
        <div className="h-full min-h-0 overflow-y-auto bg-main-bg">
          <Left />
        </div>
      </div>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={(open) => !open && closePreview()}
        downloadTitle="Recurring invoice"
        dialogTitle="Recurring invoice preview"
      >
        <PdfView />
      </DocumentPreviewDialog>
    </DocumentWorkspace>
  );
}
