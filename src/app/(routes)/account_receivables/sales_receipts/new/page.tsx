'use client';
import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
  usePreviewDownload,
} from '@potta/components/document-editor-split';

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(true);
  const { registerDownload, onDownloadPdf } = usePreviewDownload();

  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="Sales receipt"
      closeHref="/account_receivables/sales_receipts"
      className="bg-white"
      bodyClassName="flex flex-col overflow-hidden bg-white"
      headerActions={
        <>
          <LocationSwitcher />
          <DocumentPreviewToggle open={showPreview} onToggle={togglePreview} />
        </>
      }
    >
      <DocumentEditorSplit
        open={showPreview}
        onOpenChange={setShowPreview}
        downloadTitle="Sales receipt"
        onDownloadPdf={onDownloadPdf}
        editor={<Left onOpenPreview={() => setShowPreview(true)} />}
        preview={<PdfView onRegisterDownload={registerDownload} />}
      />
    </DocumentWorkspace>
  );
};

export default NewSalesReciept;
