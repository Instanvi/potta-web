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
import { DataProvider } from '@potta/components/providers/DataProvider';

const NewSalesReciept = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { registerDownload, onDownloadPdf } = usePreviewDownload();
  const togglePreview = () => setShowPreview((v) => !v);

  // Own provider: this form keeps its state in `data`, which would otherwise clobber the till's cart.
  return (
    <DocumentWorkspace
      title="New Sale"
      closeHref="/pos/sales"
      bodyClassName="flex flex-col overflow-hidden"
      headerActions={
        <>
          <LocationSwitcher />
          <DocumentPreviewToggle open={showPreview} onToggle={togglePreview} />
        </>
      }
    >
      <DataProvider>
        <DocumentEditorSplit
          open={showPreview}
          onOpenChange={setShowPreview}
          downloadTitle="Sale receipt"
          onDownloadPdf={onDownloadPdf}
          editor={<Left />}
          preview={<PdfView onRegisterDownload={registerDownload} />}
        />
      </DataProvider>
    </DocumentWorkspace>
  );
};

export default NewSalesReciept;
