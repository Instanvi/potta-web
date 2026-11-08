'use client';
import { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageHeader } from '../../_shared/states';
import TaxTable from './components/TaxTable';

const TaxesPage = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } pr-5 py-6`}
      >
        <PageHeader title="Taxes" description="Tax rates applied to items, receipts and invoices." />
        <Can
          resource="Tax"
          action="view-all"
          fallback={
            <p className="text-sm text-gray-500">You do not have permission to view taxes.</p>
          }
        >
          <TaxTable />
        </Can>
      </div>
    </RootLayout>
  );
};

export default TaxesPage;
