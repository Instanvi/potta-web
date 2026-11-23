'use client';

import InvoiceTableComponents from './components/table';
import { PageContainer } from '../../../_shared/states';

// RootLayout is rendered by vouchers/layout.tsx.
const Invoice = () => (
  <PageContainer>
    
    <InvoiceTableComponents />
  </PageContainer>
);

export default Invoice;
