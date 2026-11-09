'use client';
import React from 'react';
import CustomerContent from '../../../../components/shared/CustomerContent';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';

const Customers = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Customers"
          description="People and businesses you sell to: contact details, type and status."
        />
        <CustomerContent />
      </PageContainer>
    </RootLayout>
  );
};
export default Customers;
