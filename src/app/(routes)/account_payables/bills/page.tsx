'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import { BillsTable } from './components/table';

function BillsPageBody() {
  const selectedId = useSearchParams().get('id');

  const content = (
    <Can
      resource="Bill"
      action={['view', 'view-all']}
      fallback={
        <p className="text-sm text-muted-foreground">
          You do not have permission to view bills.
        </p>
      }
    >
      <BillsTable />
    </Can>
  );

  if (selectedId) {
    return <div className="flex h-full min-h-0 flex-col">{content}</div>;
  }

  return (
    <PageContainer className="flex h-full min-h-0 flex-col !p-3 md:!p-4">
      {content}
    </PageContainer>
  );
}

export default function BillsPage() {
  return (
    <RootLayout>
      <Suspense fallback={null}>
        <BillsPageBody />
      </Suspense>
    </RootLayout>
  );
}
