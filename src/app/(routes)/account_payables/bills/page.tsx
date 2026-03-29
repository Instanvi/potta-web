// src/app/dashboard/page.tsx (or your desired route)
'use client';

import * as React from 'react';

import { PaymentRequestDataTableWrapper } from './components/table';
import Filter from './components/filters';
import RootLayout from '../../layout';
import { ContextData } from '@potta/components/providers/DataProvider';

export default function DashboardPage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [paymentMethod, setPaymentMethod] = React.useState('all');
  const context = React.useContext(ContextData);

  const handleSearchClear = () => {
    setSearch('');
  };

  return (
    <RootLayout>
      <div
        className={`${context?.layoutMode === 'sidebar' ? 'px-14' : 'px-5'}`}
      >
        <div className="">
          <PaymentRequestDataTableWrapper
            search={search}
            status={status}
            paymentMethod={paymentMethod}
            onSearchChange={setSearch}
            onSearchClear={handleSearchClear}
            onStatusChange={setStatus}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>
      </div>
    </RootLayout>
  );
}
