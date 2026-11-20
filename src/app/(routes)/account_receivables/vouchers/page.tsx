'use client';

import InvoiceTableComponents from './components/table';
import VouchersBox from './components/boxVouchers';
import { PageContainer, PageHeader } from '../../_shared/states';

// RootLayout is rendered by vouchers/layout.tsx.
const Invoice = () => (
  <PageContainer>
    <PageHeader
      title="Vouchers"
      description="Tickets, coupons, cashbacks and loyalty programs offered to your customers."
    />
    <VouchersBox />
    <div className="mt-6">
      <InvoiceTableComponents />
    </div>
  </PageContainer>
);

export default Invoice;
