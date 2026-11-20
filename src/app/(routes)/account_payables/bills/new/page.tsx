'use client';
import { Can } from '@/components/auth/can';
import DocumentWorkspace from '@potta/components/document-workspace';
import BillForm from './components/BillForm';

export default function NewBillPage() {
  return (
    <DocumentWorkspace
      title="Bill"
      description="Record a vendor bill. It stays a draft until someone approves it."
      closeHref="/account_payables/bills"
    >
      <div className="p-4 md:p-6">
        <Can
          resource="Bill"
          action="create"
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to create bills.
            </p>
          }
        >
          <BillForm />
        </Can>
      </div>
    </DocumentWorkspace>
  );
}
