'use client';
import React, { useContext } from 'react';

import RootLayout from '../layout';
import TableAccount from './components/table';
import { ContextData } from '@potta/components/providers/DataProvider';

const Account = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div
        className={`h-full overflow-hidden ${
          context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'
        }`}
      >
        <TableAccount />
      </div>
    </RootLayout>
  );
};
export default Account;
