'use client';

import { useState } from 'react';
import { Can } from '@/components/auth/can';
import DocumentWorkspace from '@potta/components/document-workspace';
import {
  DocumentEditorSplit,
  DocumentPreviewToggle,
} from '@potta/components/document-editor-split';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import BillForm from './components/BillForm';

export default function NewBillPage() {
  const [showPreview, setShowPreview] = useState(true);
  const togglePreview = () => setShowPreview((v) => !v);

  return (
    <DocumentWorkspace
      title="New bill"
      description="Record a vendor bill. It stays a draft until someone approves it."
      closeHref="/account_payables/bills"
      bodyClassName="flex flex-col overflow-hidden"
      headerActions={
        <>
          <LocationSwitcher />
          <DocumentPreviewToggle open={showPreview} onToggle={togglePreview} />
        </>
      }
    >
      <Can
        resource="Bill"
        action="create"
        fallback={
          <p className="p-6 text-sm text-muted-foreground">
            You do not have permission to create bills.
          </p>
        }
      >
        <BillForm
          onOpenPreview={() => setShowPreview(true)}
          onTogglePreview={togglePreview}
          renderSplit={(form, preview, actions) => (
            <DocumentEditorSplit
              open={showPreview}
              onOpenChange={setShowPreview}
              downloadTitle="Bill"
              onDownloadPdf={actions?.onDownloadPdf}
              editor={form}
              preview={preview}
            />
          )}
        />
      </Can>
    </DocumentWorkspace>
  );
}
