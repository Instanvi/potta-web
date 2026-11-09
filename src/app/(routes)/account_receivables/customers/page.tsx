'use client';
import React from 'react';
import CustomerContent from '../../../../components/shared/CustomerContent';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';

const InvoiceCustomers = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Customers"
          description="People and businesses you invoice: contact details, type and status."
        />
        <CustomerContent />
      </PageContainer>
    </RootLayout>
  );
};
export default InvoiceCustomers;
