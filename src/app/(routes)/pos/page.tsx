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
        <div className="flex min-h-0 flex-1 w-full">
          <div className="min-h-0 min-w-0 basis-[57.14%] flex-[4]">
            <SaleInvoiceCard />
          </div>
          <div className="min-h-0 min-w-0 basis-[42.86%] flex-[3] border-l border-[var(--pos-border)] bg-white">
            <SaleInvoiceTable />
          </div>
        </div>
        <div className="z-30 h-[100px] w-full shrink-0 bg-[var(--pos-green)]">
          <HeldOrders />
        </div>
      </div>
    </RootLayout>
  );
};

export default POS;
