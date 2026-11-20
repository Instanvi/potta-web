'use client';

import RootLayout from '../../layout';
import InvoiceTableComponents from './components/table';
import { PageContainer, PageHeader } from '../../_shared/states';

const Invoice = () => (
  <RootLayout>
    <PageContainer>
      <PageHeader
        title="Recurring invoices"
        description="Invoices that are issued to customers on a repeating schedule."
      />
      <InvoiceTableComponents />
    </PageContainer>
  </RootLayout>
);

export default Invoice;
