'use client';

import React from 'react';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';
import SaleTable from './components/table';

const Files = () => (
  <RootLayout>
    <PageContainer>
      <PageHeader
        title="Sales receipts"
        description="Sales paid on the spot, with the customer, payment method and amount received."
      />
      <SaleTable />
    </PageContainer>
  </RootLayout>
);

export default Files;
