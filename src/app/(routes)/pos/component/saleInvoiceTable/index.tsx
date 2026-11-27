'use client';
import React, { useContext } from 'react';
import SaleInvoiceButons from './components/buttonSales';
import TableOPS from './components/table';
import { ContextData } from '@potta/components/providers/DataProvider';
import OtherMethod from './components/otherPayment';
import CashPayment from './components/cashPayment';
import Calculator from './components/calculator';

const SaleInvoiceTable = () => {
  const context = useContext(ContextData);

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        {context?.itemSelected === 'cart' && <TableOPS />}
        {context?.itemSelected === 'calculate' && <Calculator />}
        {context?.itemSelected === 'other' && <OtherMethod />}
        {context?.itemSelected === 'cash' && <CashPayment />}
      </div>
      <div className="shrink-0">
        <SaleInvoiceButons />
      </div>
    </div>
  );
};

export default SaleInvoiceTable;
