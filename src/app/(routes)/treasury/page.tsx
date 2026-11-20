'use client';
import { ContextData } from '@potta/components/providers/DataProvider';
import RootLayout from '../layout';
import React, { useContext } from 'react';
import TreasuryMainDashboard from './components/TreasuryMainDashboard';

const Treasury = () => {
  const context = useContext(ContextData);

  return (
    <RootLayout>
      <div className={`${context?.layoutMode === 'sidebar' ? 'pl-8' : 'pl-5'}`}>
        <TreasuryMainDashboard type="treasury" />
      </div>
    </RootLayout>
  );
};

export default Treasury;
