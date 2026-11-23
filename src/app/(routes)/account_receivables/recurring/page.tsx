'use client';

import RootLayout from '../../layout';
import InvoiceTableComponents from './components/table';
import { PageContainer } from '../../_shared/states';

const Invoice = () => (
  <RootLayout>
    <PageContainer>
      
      <InvoiceTableComponents />
    </PageContainer>
  </RootLayout>
);

export default Invoice;
