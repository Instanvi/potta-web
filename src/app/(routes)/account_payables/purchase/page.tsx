'use client';

import InvoiceTableComponents from './components/table';
import { PageContainer, PageHeader } from '../../_shared/states';

const Invoice = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Purchase orders"
        description="Orders sent to vendors: approve them, track shipping, then turn them into bills."
      />
      <InvoiceTableComponents />
    </PageContainer>
  );
};

export default Invoice;
