'use client';
import React, { useContext } from 'react';
import RootLayout from '../layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import ARMainDashboard from './components/ARMainDashboard';

const AccountReceivablesDashboard = () => {
  const context = useContext(ContextData);
  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'}`}>
        <ARMainDashboard type="ar" />
      </div>
    </RootLayout>
  );
};
export default AccountReceivablesDashboard;
