import { useState, useEffect } from 'react';
import axios from 'config/axios.config';

interface AccountFilter {
  page?: number;
  limit?: number;
  search?: string;
  searchBy?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  type?: 'Revenue' | 'Expense' | 'Asset' | 'Liability' | 'Equity';
  organizationId?: string;
  branchId?: string;
}

export interface Account {
  uuid: string;
  name: string;
  code: string;
  type: string;
  organizationId: string;
  branchId: string;
  isActive: boolean;
  path: string | null;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  children?: Account[];
  parent?: Account | null;
}

export const useAccountingAccounts = (initialFilter: AccountFilter = {}) => {
  // Set default filter values
  const defaultFilter: AccountFilter = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    searchBy: ['name', 'code', 'type'],
    ...initialFilter,
  };

  const [filter, setFilter] = useState<AccountFilter>(defaultFilter);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();

      // Add pagination params
      if (filter.page) queryParams.append('page', filter.page.toString());
      if (filter.limit) queryParams.append('limit', filter.limit.toString());

      // Add search param
      if (filter.search) queryParams.append('search', filter.search);

      // Add searchBy param
      if (filter.searchBy && filter.searchBy.length > 0) {
        filter.searchBy.forEach((field) => {
          queryParams.append('searchBy', field);
        });
      }

      // Add sorting
      if (filter.sortBy && filter.sortOrder) {
        queryParams.append('sortBy', `${filter.sortBy}:${filter.sortOrder}`);
      }

      // Add type filter if provided
      if (filter.type) {
        queryParams.append('filter', `type:$eq:${filter.type}`);
      }

      const response = await axios.get(`/accounting?${queryParams.toString()}`);

      setAccounts(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Error fetching accounting accounts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [filter]);

  const updateFilter = (newFilter: Partial<AccountFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const refetch = () => {
    fetchAccounts();
  };

  return {
    accounts,
    meta,
    loading,
    error,
    filter,
    updateFilter,
    refetch,
  };
};
