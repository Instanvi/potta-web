'use client';
import React from 'react';
import RootLayout from '../layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import DashboardCollection from '../dashboard/components/collection';

const AccountReceivablesDashboard = () => {
  const context = React.useContext(ContextData);
  return (
    <RootLayout>
      {/* <CustomerContent /> */}
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16' : 'pl-5'
        } pr-5 mt-2`}
      >
        <DashboardCollection />
      </div>
    </RootLayout>
  );
};
export default AccountReceivablesDashboard;
