'use client';

import { useState } from 'react';
import InvoiceTableComponents from './components/table';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';

const Invoice = () => {
  const [page, setPage] = useState(1);
  const context = useContext(ContextData);

  return (
    <div
      className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'} py-5`}
    >

      <div className="">
        <InvoiceTableComponents />
      </div>
    </div>
  );
};

export default Invoice;
