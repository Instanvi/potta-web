'use client';
import React, { useContext, useState } from 'react';
import SaleInvoiceButons from './components/buttonSales';
import TableOPS from './components/table';
import { ContextData } from '@potta/components/providers/DataProvider';
// import Calculator from "@/app/(routes)/calculator/page";
import OtherMethod from './components/otherPayment';

import ModalPrint from '../print/page';
import CashPayment from './components/cashPayment';
import Calculator from './components/calculator';
const SaleInvoiceTable = () => {
  const context = useContext(ContextData);
  const [selected, setSelected] = useState([]);
  return (
    <div className="w-full h-[85vh] ">
      {context?.itemSelected == 'cart' && (
        <div className="h-[77vh] w-full bg-white pb-2  overflow-y-auto scrollbar-hide">
          <TableOPS />
        </div>
      )}

      {context?.itemSelected == 'calculate' && (
        <div className="w-full h-[77vh] bg-white pb-2  overflow-y-auto">
          <Calculator />
        </div>
      )}
      {context?.itemSelected == 'other' && (
        <div className="h-[77vh] bg-white w-full pb-2  overflow-y-auto">
          <OtherMethod />
        </div>
      )}
      {context?.itemSelected == 'cash' && (
        <div className="h-[77vh] w-full bg-white pb-2  overflow-y-auto">
          <CashPayment />
        </div>
      )}
      <div className="mt-2">
        <SaleInvoiceButons />
      </div>
    </div>
  );
};
export default SaleInvoiceTable;
