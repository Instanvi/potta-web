'use client';

import InvoiceTableComponents from './components/table';
import { PageContainer, PageHeader } from '../../../_shared/states';

// RootLayout is rendered by vouchers/layout.tsx.
const Invoice = () => (
  <PageContainer>
    <PageHeader
      title="Recurring vouchers"
      description="Vouchers that are issued to customers on a repeating schedule."
    />
    <InvoiceTableComponents />
  </PageContainer>
);

export default Invoice;
