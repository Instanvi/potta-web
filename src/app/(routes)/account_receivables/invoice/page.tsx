'use client';
import RootLayout from '../../layout';
import InvoiceTable from './components/table';
import { InvoiceFilterProvider } from './_context/InvoiceFilterContext';
import { PageContainer, PageHeader } from '../../_shared/states';

const Invoice = () => (
  <InvoiceFilterProvider>
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Invoices"
          description="Bill customers, track approval and follow payments until they are settled."
        />
        <InvoiceTable />
      </PageContainer>
    </RootLayout>
  </InvoiceFilterProvider>
);

export default Invoice;
