'use client';

import InvoiceTableComponents from './components/table';
import VouchersBox from './components/boxVouchers';
import { PageContainer } from '../../_shared/states';

// RootLayout is rendered by vouchers/layout.tsx.
const Invoice = () => (
  <PageContainer>
    
    <VouchersBox />
    <div className="mt-6">
      <InvoiceTableComponents />
    </div>
  </PageContainer>
);

export default Invoice;
