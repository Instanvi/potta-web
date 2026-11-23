'use client';

import React from 'react';
import RootLayout from '../../layout';
import { PageContainer } from '../../_shared/states';
import SaleTable from './components/table';

const Files = () => (
  <RootLayout>
    <PageContainer>
      
      <SaleTable />
    </PageContainer>
  </RootLayout>
);

export default Files;
