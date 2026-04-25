import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../utils/api';
import { Budget } from '../utils/types';

export interface BudgetFilter {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: string;
  organizationId?: string;
  branchId?: string;
}

export const useBudgets = (initialFilter: BudgetFilter = {}) => {
  // Default organization and branch IDs - in a real app, these would come from user context/auth

  // Set default filter values
  const defaultFilter: BudgetFilter = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',

    ...initialFilter,
  };

  const [filter, setFilter] = useState<BudgetFilter>(defaultFilter);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['budgets', filter],
    queryFn: async () => {
      // Use the archived endpoint if status is 'archived'
      if (filter.status === 'archived') {
        return await budgetsApi.getArchivedBudgets(filter);
      }
      return await budgetsApi.getBudgets(filter);
    },
  });

  const updateFilter = (newFilter: Partial<BudgetFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  return {
    budgets: data?.data || [],
    meta: data?.meta,
    loading,
    error,
    filter,
    updateFilter,
    refetch,
  };
};
