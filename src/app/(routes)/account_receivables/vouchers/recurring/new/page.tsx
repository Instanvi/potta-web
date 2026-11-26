'use client';

import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
  usePreviewDownload,
} from '@potta/components/document-editor-split';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';

export default function NewRecurringVoucherPage() {
  const [showPreview, setShowPreview] = useState(true);
  const { registerDownload, onDownloadPdf } = usePreviewDownload();
  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="New recurring voucher"
      closeHref="/account_receivables/vouchers/recurring"
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
        downloadTitle="Recurring voucher"
        onDownloadPdf={onDownloadPdf}
        editor={<Left />}
        preview={<PdfView onRegisterDownload={registerDownload} />}
      />
    </DocumentWorkspace>
  );
}
