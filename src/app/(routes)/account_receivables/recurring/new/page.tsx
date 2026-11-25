'use client';

import React, { useState } from 'react';
import Left from './components/left';
import PdfView from './components/pdfview';
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
} from '@potta/components/document-editor-split';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';

export default function NewRecurringInvoicePage() {
  const [showPreview, setShowPreview] = useState(true);
  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="New recurring invoice"
      closeHref="/account_receivables/recurring"
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
        downloadTitle="Recurring invoice"
        editor={<Left />}
        preview={<PdfView />}
      />
    </DocumentWorkspace>
  );
}
