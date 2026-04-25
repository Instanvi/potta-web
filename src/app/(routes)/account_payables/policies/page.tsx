'use client';
import { useContext } from 'react';
import RootLayout from '../../layout';
import PolicyTable from '../../policies/components/table';
import { ContextData } from '@potta/components/providers/DataProvider';

const Invoice = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div
        className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'}`}
      >
        <div className="">
          <PolicyTable />
        </div>
      </div>
    </RootLayout>
  );
};

export default Invoice;
