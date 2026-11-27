'use client';
import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
  usePreviewDownload,
} from '@potta/components/document-editor-split';
import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';

const NewPurchaseOrderPage = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { registerDownload, onDownloadPdf } = usePreviewDownload();
  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="Purchase order"
      closeHref="/account_payables/purchase"
      bodyClassName="flex flex-col overflow-hidden"
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
        downloadTitle="Purchase order"
        onDownloadPdf={onDownloadPdf}
        editor={<Left />}
        preview={<PdfView onRegisterDownload={registerDownload} />}
      />
    </DocumentWorkspace>
  );
};

export default NewPurchaseOrderPage;
