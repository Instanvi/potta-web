'use client';

import React, { useCallback, useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import DocumentWorkspace from '@potta/components/document-workspace';
import { DocumentPreviewDialog } from '@potta/components/document-preview-dialog';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';

export default function NewCreditNotePage() {
  const [showPreview, setShowPreview] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState<(() => Promise<void>) | null>(
    null,
  );
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    setDownloadPdf(() => fn);
  }, []);
  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const extractInvoiceData = async (_file: File) => {
    setExtracting(true);
    setTimeout(() => setExtracting(false), 1500);
  };

  return (
    <DocumentWorkspace
      title="New credit note"
      closeHref="/account_receivables/credit"
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
      <FileExtractDropzone onExtract={extractInvoiceData} extracting={extracting}>
        <div className="flex h-full min-h-0 flex-col bg-main-bg">
          <div className="h-full min-h-0 overflow-y-auto bg-main-bg">
            <Left onOpenPreview={openPreview} />
          </div>
        </div>
      </FileExtractDropzone>

      <DocumentPreviewDialog
        open={showPreview}
        onOpenChange={(open) => !open && closePreview()}
        downloadTitle="Credit note"
        dialogTitle="Credit note preview"
        onDownloadPdf={downloadPdf ?? undefined}
      >
        <PdfView onRegisterDownload={registerDownload} />
      </DocumentPreviewDialog>
    </DocumentWorkspace>
  );
}
