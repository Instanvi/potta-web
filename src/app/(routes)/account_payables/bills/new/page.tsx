'use client';
import Link from 'next/link';
import { Can } from '@/components/auth/can';
import DocumentWorkspace from '@potta/components/document-workspace';
import BillForm from './components/BillForm';

export default function NewBillPage() {
  return (
    <DocumentWorkspace
      title="Bill"
      description="Record a vendor bill. It stays a draft until someone approves it."
      closeHref="/account_payables/bills"
      footer={
        <div className="flex w-full justify-between gap-3">
          <Link href="/account_payables/bills" className="inline-flex h-10 items-center rounded-[2px] border border-input px-4 text-sm font-medium hover:bg-accent">
            Cancel
          </Link>
          <span className="text-xs text-muted-foreground self-center">Use Save on the form to create the bill.</span>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <Can
          resource="Bill"
          action="create"
          fallback={<p className="text-sm text-muted-foreground">You do not have permission to create bills.</p>}
        >
          <BillForm />
        </Can>
      </div>
    </DocumentWorkspace>
  );
}
