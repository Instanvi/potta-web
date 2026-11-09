'use client';
import React from 'react';

import RootLayout from '../layout';
import TableAccount from './components/table';
import { PageContainer, PageHeader } from '../_shared/states';

const Account = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Chart of accounts"
          description="OHADA accounts with their current balances. Codes are generated from the parent account."
        />
        <TableAccount />
      </PageContainer>
    </RootLayout>
  );
};
export default Account;
