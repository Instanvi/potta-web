'use client';
import { useContext } from 'react';
import { ContextData } from '@potta/components/providers/DataProvider';
import { Can } from '@/components/auth/can';
import RootLayout from '../../layout';
import { PageHeader } from '../../_shared/states';
import CashbookTable from './components/CashbookTable';

const CashbookPage = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'
        } pr-5 py-6`}
      >
        <PageHeader
          title="Cashbook"
          description="Cash and bank movements (OHADA class 5) with automatic journal posting."
        />
        <Can
          resource="Cashbook"
          action="view"
          fallback={
            <p className="text-sm text-gray-500">
              You do not have permission to view the cashbook.
            </p>
          }
        >
          <CashbookTable />
        </Can>
      </div>
    </RootLayout>
  );
};

export default CashbookPage;
