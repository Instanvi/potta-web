'use client';

import React from 'react';
import RootLayout from '../../layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import SaleTable from './components/table';

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
