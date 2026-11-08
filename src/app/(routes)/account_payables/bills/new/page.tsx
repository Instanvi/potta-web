'use client';
import { useContext } from 'react';
import Link from 'next/link';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../../layout';
import { PageHeader } from '../../../_shared/states';
import BillForm from './components/BillForm';

export default function NewBillPage() {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'} pr-5 py-6`}>
        <PageHeader
          title="New bill"
          description="Record a vendor bill. It stays a draft until someone approves it."
          actions={
            <Link href="/account_payables/bills" className="text-sm text-gray-600 hover:text-green-700">
              <i className="ri-arrow-left-line mr-1" />
              Back to bills
            </Link>
          }
        />
        <Can
          resource="Bill"
          action="create"
          fallback={<p className="text-sm text-gray-500">You do not have permission to create bills.</p>}
        >
          <BillForm />
        </Can>
      </div>
    </RootLayout>
  );
}
