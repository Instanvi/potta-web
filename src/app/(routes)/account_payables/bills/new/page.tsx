'use client';

import { useState } from 'react';
import { Can } from '@/components/auth/can';
import DocumentWorkspace from '@potta/components/document-workspace';
import { LocationSwitcher } from '@potta/components/shell/location-switcher';
import BillForm from './components/BillForm';

export default function NewBillPage() {
  const [showPreview, setShowPreview] = useState(false);
  const openPreview = () => setShowPreview(true);

  return (
    <DocumentWorkspace
      title="New bill"
      description="Record a vendor bill. It stays a draft until someone approves it."
      closeHref="/account_payables/bills"
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
          showPreview={showPreview}
          onOpenPreview={openPreview}
          onClosePreview={() => setShowPreview(false)}
        />
      </Can>
    </DocumentWorkspace>
  );
}
