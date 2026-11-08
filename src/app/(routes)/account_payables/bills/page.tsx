'use client';
import { Suspense, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageHeader } from '../../_shared/states';
import { BillsTable } from './components/table';

/** `?id=<bill uuid>` (used by notification links) opens that bill's details. */
const BillsList = () => {
  const searchParams = useSearchParams();
  return <BillsTable initialBillId={searchParams.get('id')} />;
};

export default function BillsPage() {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'} pr-5 py-6`}>
        <PageHeader
          title="Bills"
          description="Vendor bills: approve to post the expense and payable, then record the payment."
        />
        <Can
          resource="Bill"
          action={['view', 'view-all']}
          fallback={<p className="text-sm text-gray-500">You do not have permission to view bills.</p>}
        >
          <Suspense fallback={null}>
            <BillsList />
          </Suspense>
        </Can>
      </div>
    </RootLayout>
  );
}
