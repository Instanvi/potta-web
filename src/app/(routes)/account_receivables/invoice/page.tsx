'use client';

import { Suspense } from 'react';
import RootLayout from '../../layout';
import InvoiceTable from './components/table';
import { InvoiceFilterProvider } from './_context/InvoiceFilterContext';
import { PageContainer } from '../../_shared/states';

const Invoice = () => (
  <InvoiceFilterProvider>
    <RootLayout>
      <PageContainer className="flex h-full min-h-0 flex-col !p-3 md:!p-4">
        <Suspense fallback={null}>
          <InvoiceTable />
        </Suspense>
      </PageContainer>
    </RootLayout>
  </InvoiceFilterProvider>
);

export default Invoice;
