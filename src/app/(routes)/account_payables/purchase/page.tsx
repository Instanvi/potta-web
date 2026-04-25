'use client';

import { ContextData } from '@potta/components/providers/DataProvider';
import InvoiceTableComponents from './components/table';


import { useContext, useState } from 'react';

const Invoice = () => {
  const [detailsModal, setDetailsModal] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const context = useContext(ContextData);
  return (
    <div
      className={`${context?.layoutMode === 'sidebar' ? ' pl-12' : 'p-5'} pr-5`}
    >
      {/* <CustomInput />
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Choose an option"
      /> */}
      <div className="mt-5 overflow-y-hidden ">
        <InvoiceTableComponents />
      </div>
    </div>
  );
};

export default Invoice;
