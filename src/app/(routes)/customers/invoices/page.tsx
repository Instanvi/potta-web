'use client';

import { useState } from 'react';

import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import InvoiceTableComponents from '../../account_receivables/credit/components/table';
const Invoice = () => {
  const context = useContext(ContextData);

  return (
    <div className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'}`}>
      {/* <CustomInput />
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Choose an option"
      /> */}
      <div className="">
        <InvoiceTableComponents />
      </div>
    </div>
  );
};

export default Invoice;
