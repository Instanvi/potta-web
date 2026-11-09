import React from 'react';

import Boxes from './components/boxes';
import TableComponents from './components/table';
import RootLayout from '../layout';
import { PageContainer, PageHeader } from '../_shared/states';

const Vendors = () => {
  return (
    <RootLayout>
      <PageContainer>
        <PageHeader
          title="Vendors"
          description="Suppliers you buy from: contact details, KYC status and opening balances."
        />
        <div className="mb-5">
          <Boxes />
        </div>
        <TableComponents />
      </PageContainer>
    </RootLayout>
  );
};
export default Vendors;
