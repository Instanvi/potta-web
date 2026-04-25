'use client';

import React from 'react';
import RootLayout from '../../layout';
import Filter from './components/filters';
import SaleTable from './components/table';
import { ContextData } from '@potta/components/providers/DataProvider';

const Files = () => {
  const context = React.useContext(ContextData);

  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } pr-5 w-full mt-10`}
      >
        <SaleTable />
      </div>
    </RootLayout>
  );
};

export default Files;
