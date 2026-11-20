'use client';
import React, { useState } from 'react';
import Filter from './components/Filters';
import TransactionsTable from './components/TransactionsTable';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useContext } from 'react';

const TransactionsPage = () => {
  const context = useContext(ContextData);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('All Time');
  return (
    <div className={`${context?.layoutMode === 'sidebar' ? 'p-5 pl-12' : 'p-5'}`}>
      <Filter
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <TransactionsTable
        search={search}
        status={status}
        dateRange={dateRange}
      />
    </div>
  );
};

export default TransactionsPage;
