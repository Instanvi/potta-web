'use client';
import React from 'react';
import SaleInvoiceTable from './component/saleInvoiceTable';
import SaleInvoiceCard from './component/saleInvoiceCard';
import RootLayout from '../layout';
import HeldOrders from './component/footer';

const POS = () => {
  return (
    <RootLayout>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex min-h-0 w-full flex-1 gap-0 p-2.5 pb-0">
          <div className="min-h-0 w-[57%]">
            <SaleInvoiceCard />
          </div>
          <div className="min-h-0 w-[43%]">
            <SaleInvoiceTable />
          </div>
        </div>
        <div className="z-30 h-[100px] w-full shrink-0 bg-[#1E5B13]">
          <HeldOrders />
        </div>
      </div>
    </RootLayout>
  );
};
export default POS;
