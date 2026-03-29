'use client';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';
import RootLayout from '../../layout';
import ProformaInvoiceTable from './components/table';

const ProformaInvoices = () => {
  const context = useContext(ContextData);

  return (
    <RootLayout>
      <div
        className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'}`}
      >
        <div className="">
          <ProformaInvoiceTable />
        </div>
      </div>
    </RootLayout>
  );
};

export default ProformaInvoices;
