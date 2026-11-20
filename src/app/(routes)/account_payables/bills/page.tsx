'use client';

import { Suspense } from 'react';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import { BillsTable } from './components/table';

export default function BillsPage() {
  return (
    <RootLayout>
      <PageContainer className="flex h-full min-h-0 flex-col !p-3 md:!p-4">
        <Can
          resource="Bill"
          action={['view', 'view-all']}
          fallback={
            <p className="text-sm text-muted-foreground">
              You do not have permission to view bills.
            </p>
          }
        >
          <Suspense fallback={null}>
            <BillsTable />
          </Suspense>
        </Can>
      </PageContainer>
    </RootLayout>
  );
}
