'use client';
import React from 'react';
import CustomerContent from '../../../../components/shared/CustomerContent';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';

const POSCustomers = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Customers"
          description="Shoppers you sell to at the counter: contact details, type and status."
        />
        <CustomerContent />
      </PageContainer>
    </RootLayout>
  );
};
export default POSCustomers;
