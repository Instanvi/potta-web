'use client';

import { Suspense } from 'react';
import RootLayout from '../../layout';
import InvoiceTable from './components/table';
import { InvoiceFilterProvider } from './_context/InvoiceFilterContext';

const Invoice = () => (
  <InvoiceFilterProvider>
    <RootLayout>
      <div className="flex h-full min-h-0 flex-col">
        <Suspense fallback={null}>
          <InvoiceTable />
        </Suspense>
      </div>
    </RootLayout>
  </InvoiceFilterProvider>
);

export default Invoice;
