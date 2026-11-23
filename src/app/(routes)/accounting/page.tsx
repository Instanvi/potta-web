'use client';
import React from 'react';

import RootLayout from '../layout';
import TableAccount from './components/table';
import { PageContainer } from '../_shared/states';

const Account = () => {
  return (
    <RootLayout>
      <PageContainer>
        
        <TableAccount />
      </PageContainer>
    </RootLayout>
  );
};
export default Account;
