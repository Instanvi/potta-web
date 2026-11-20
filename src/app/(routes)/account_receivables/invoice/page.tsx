'use client';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import RootLayout from '../../layout';
import InvoiceTable from './components/table';
import { InvoiceFilterProvider } from './_context/InvoiceFilterContext';

// Move the context provider to a higher level component
const InvoiceWithProvider = () => {
  return (
    <InvoiceFilterProvider>
      <Invoice />
    </InvoiceFilterProvider>
  );
};

const Invoice = () => {
  const context = useContext(ContextData);

  return (
    <RootLayout>
      <div
        className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'}`}
      >
        <div className="">
          <InvoiceTable />
        </div>
      </div>
    </RootLayout>
  );
};

export default InvoiceWithProvider;
