'use client';

import { useContext, useState } from 'react';

import PolicyTable from './components/table';
import { ContextData } from '@potta/components/providers/DataProvider';
const Invoice = () => {
  const context = useContext(ContextData);

  return (
    <div className={`${context?.layoutMode === 'sidebar' ? 'px-14s' : 'px-5'}`}>
      {/* <CustomInput />
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Choose an option"
      /> */}
      <div className="">
        <PolicyTable />
      </div>
    </div>
  );
};

export default Invoice;
