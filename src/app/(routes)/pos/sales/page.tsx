'use client';

import React from 'react';
import RootLayout from '../../layout';
import SaleTable from './components/table';
import { PageContainer, PageHeader } from '../../_shared/states';

const Files = () => (
  <RootLayout>
    <PageContainer>
      <PageHeader title="Sales" description="Point-of-sale receipts recorded at the register or entered manually." />
      <SaleTable />
    </PageContainer>
  </RootLayout>
);

export default Files;
