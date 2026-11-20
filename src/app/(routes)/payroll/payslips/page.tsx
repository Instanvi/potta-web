'use client';
import React from 'react';
import PayslipFilters from './components/filters';
import PayslipTable from './components/table';
import RootLayout from '../../layout';

const PayslipsPage = () => {
  return (
    <RootLayout>
      <div className="pl-10 pr-5">
        <div className="p-6">
          <PayslipFilters />
          <PayslipTable />
        </div>
      </div>
    </RootLayout>
  );
};

export default PayslipsPage;
