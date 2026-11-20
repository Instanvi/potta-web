'use client';
import React from 'react';
import Boxes from './components/boxes';
import PayBreakDown from './components/payBreakdown';
import PayrollTable from './components/table';
import RootLayout from '../../layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const Overview = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>
        <div className="px-14">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-medium text-gray-900 mb-2">
              Payroll Overview
            </h1>
            <p className="text-gray-600">
              Manage employee compensation and payroll processing
            </p>
          </div>

          {/* Metrics Section */}
          <div className="mb-6">
            <Boxes />
          </div>

          {/* Pay Breakdown Section */}
          <div className="mb-6">
            <PayBreakDown />
          </div>

          {/* Table Section */}
          <div className="bg-white p-6">
            <PayrollTable />
          </div>
        </div>
      </RootLayout>
      {/* {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />} */}
    </QueryClientProvider>
  );
};

export default Overview;
