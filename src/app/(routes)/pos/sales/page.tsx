'use client';

import React from 'react';
import RootLayout from '../../layout';
import SaleTable from './components/table';
import { PageContainer } from '../../_shared/states';

const Files = () => (
  <RootLayout>
    <PageContainer>
      
      <SaleTable />
    </PageContainer>
  </RootLayout>
);

export default Files;
