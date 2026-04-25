'use client';

import InvoiceTableComponents from './components/table';
import VouchersBox from './components/boxVouchers';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';

const Invoice = () => {
  const context = useContext(ContextData);

  return (
    <div
      className={`min-h-full bg-white ${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'} py-6`}
    >
      <div className="bg-white">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-black">
          Vouchers
        </h1>
        <VouchersBox />
        <div className="mt-10">
          <InvoiceTableComponents />
        </div>
      </div>
    </div>
  );
};

export default Invoice;
