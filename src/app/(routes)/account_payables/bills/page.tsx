'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import { BillsTable } from './components/table';

/** `?id=<bill uuid>` (used by notification links) opens that bill's details. */
const BillsList = () => {
  const searchParams = useSearchParams();
  return <BillsTable initialBillId={searchParams.get('id')} />;
};

export default function BillsPage() {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Bills"
          description="Vendor bills: approve to post the expense and payable, then record the payment."
        />
        <Can
          resource="Bill"
          action={['view', 'view-all']}
          fallback={<p className="text-sm text-muted-foreground">You do not have permission to view bills.</p>}
        >
          <Suspense fallback={null}>
            <BillsList />
          </Suspense>
        </Can>
      </PageContainer>
    </RootLayout>
  );
}
