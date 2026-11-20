'use client';
import React, { useState } from 'react';
import RootLayout from '../../../layout';
import Filter from './components/filters';
import SingleBudget from './components/data';
import BudgetTable from './components/table';
import { useParams } from 'next/navigation';
import { ContextData } from '@potta/components/providers/DataProvider';
const BudgetDetailsPage = () => {
  const params = useParams();
  const budgetId = params.id as string;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('All Time');
  const context = React.useContext(ContextData);
  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } pr-5 mt-10`}
      >
        <SingleBudget />
        {/* filter */}
        <Filter
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        {/* Table */}
        <BudgetTable
          budgetId={budgetId}
          search={search}
          status={status}
          dateRange={dateRange}
        />
      </div>
    </RootLayout>
  );
};

export default BudgetDetailsPage;
