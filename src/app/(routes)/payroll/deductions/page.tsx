'use client';
import React, { useContext } from 'react';
import DeductionFilters from './components/filters';
import DeductionTable from './components/table';
import RootLayout from '../../layout';
import { ContextData } from '@potta/components/providers/DataProvider';

const DeductionsPage = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'}`}>
        <div className="p-2">
          <DeductionFilters />
          <DeductionTable />
        </div>
      </div>
    </RootLayout>
  );
};

export default DeductionsPage;
