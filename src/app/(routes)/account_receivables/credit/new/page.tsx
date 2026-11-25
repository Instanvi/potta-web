'use client';

import React, { useCallback, useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import FileExtractDropzone from '@potta/components/FileExtractDropzone';
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
} from '@potta/components/document-editor-split';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';

export default function NewCreditNotePage() {
  const [showPreview, setShowPreview] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [downloadPdf, setDownloadPdf] = useState<(() => Promise<void>) | null>(
    null,
  );
  const registerDownload = useCallback((fn: () => Promise<void>) => {
    setDownloadPdf(() => fn);
  }, []);
  const togglePreview = () => setShowPreview((v) => !v);

  const extractInvoiceData = async (_file: File) => {
    setExtracting(true);
    setTimeout(() => setExtracting(false), 1500);
  };

  return (
    <DocumentWorkspace
      title="New credit note"
      closeHref="/account_receivables/credit"
      bodyClassName="flex flex-col overflow-hidden"
      headerActions={
        <>
          <LocationSwitcher />
          <DocumentPreviewToggle open={showPreview} onToggle={togglePreview} />
        </>
      }
    >
      <FileExtractDropzone onExtract={extractInvoiceData} extracting={extracting}>
        <DocumentEditorSplit
          open={showPreview}
          onOpenChange={setShowPreview}
          downloadTitle="Credit note"
          onDownloadPdf={downloadPdf ?? undefined}
          editor={<Left onOpenPreview={() => setShowPreview(true)} />}
          preview={<PdfView onRegisterDownload={registerDownload} />}
        />
      </FileExtractDropzone>
    </DocumentWorkspace>
  );
}
