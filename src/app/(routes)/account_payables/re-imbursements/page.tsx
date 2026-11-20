'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ReimbursementDataTableWrapper } from './components/table';
import Filter from './components/filters';
import RootLayout from '../../layout';
import { ContextData } from '@potta/components/providers/DataProvider';
import { useGetReimbursements } from './hooks/useReimbursements';
import { Reimbursement } from './utils/api-types';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function ReimbursementsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const context = React.useContext(ContextData);

  // Fetch reimbursements from API
  const {
    data: reimbursementsData,
    isLoading,
    error,
    refetch,
  } = useGetReimbursements({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page: 1,
    limit: 50,
  });

  const reimbursements = reimbursementsData || [];

  const handleAddReimbursement = () => {
    // Refetch data after adding new reimbursement
    refetch();
  };

  const handleFiltersChange = (filters: {
    search?: string;
    status?: string;
    type?: string;
  }) => {
    if (filters.search !== undefined) setSearchTerm(filters.search);
    if (filters.status !== undefined) setStatusFilter(filters.status);
    if (filters.type !== undefined) setTypeFilter(filters.type);
  };
  console.log('reimbursements', reimbursements);
  if (error) {
    return (
      <RootLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Filter
            onNew={handleAddReimbursement}
            onFiltersChange={handleFiltersChange}
            currentFilters={{
              search: searchTerm,
              status: statusFilter,
              type: typeFilter,
            }}
          />
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading reimbursements</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-green-600 text-white  hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>
        <div
          className={`${
            context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
          } min-h-[92vh] space-y-4 pr-5 w-full`}
        >
          {/* Action/Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
            <Filter
              onNew={handleAddReimbursement}
              onFiltersChange={handleFiltersChange}
              currentFilters={{
                search: searchTerm,
                status: statusFilter,
                type: typeFilter,
              }}
            />
          </div>

          {/* Reimbursements Table */}
          <div>
            <ReimbursementDataTableWrapper
              reimbursements={reimbursements}
              isLoading={isLoading}
              onRefresh={refetch}
            />
          </div>
        </div>
      </RootLayout>
    </QueryClientProvider>
  );
}
