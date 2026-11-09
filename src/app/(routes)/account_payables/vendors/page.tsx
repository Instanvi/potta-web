'use client';
import React from 'react';
import VendorContent from '../../../../components/shared/VendorContent';
import RootLayout from '../../layout';
import { PageContainer, PageHeader } from '../../_shared/states';

const PayablesVendors = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Vendors"
          description="Suppliers you buy from: contact details, KYC status and opening balances."
        />
        <VendorContent />
      </PageContainer>
    </RootLayout>
  );
};
export default PayablesVendors;
