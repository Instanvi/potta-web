'use client';
import React from 'react';
import SaleInvoiceTable from './component/saleInvoiceTable';
import SaleInvoiceCard from './component/saleInvoiceCard';

import Print from './component/print/page';
import RootLayout from '../layout';
import { Toaster } from 'sonner';
import HeldOrders from './component/footer';

const POS = () => {
  return (
    <RootLayout>
      <Toaster />
      <div className="h-full min-h-0 overflow-hidden">
        <div className="h-[85vh] p-3 flex w-full">
          <div className="w-[60%]">
            <SaleInvoiceCard />
          </div>
          <div className="w-[40%]">
            <SaleInvoiceTable />
          </div>
        </div>
        <div className="w-full h-[7vh] bg-[#005D1F] z-30 fixed bottom-0">
          <div className="">
            <HeldOrders />
          </div>
        </div>
      </div>
    </RootLayout>
  );
};
export default POS;
