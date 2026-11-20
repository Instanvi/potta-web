import axios from 'config/axios.config';
import { AxiosResponse } from 'axios';
import { accountPayload, accountUpdatePayload } from './validations';

//
interface AccountsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  filter?: string[];
}



export const accountsApi = {
  // Get the full hierarchical Chart of Accounts tree
  getAll: async () => {
    const result = await axios.get('/accounting/accounts/tree');
    return result.data;
  },

  // Get accounts with filtering and pagination
  getFiltered: async (params: AccountsQueryParams = {}) => {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    if (params.sortBy && params.sortBy.length > 0) {
      params.sortBy.forEach((sort) => {
        queryParams.append('sortBy', sort);
      });
    }

    if (params.search) queryParams.append('search', params.search);

    if (params.filter && params.filter.length > 0) {
      params.filter.forEach((filter) => {
        queryParams.append('filter', filter);
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/accounting${queryString ? `?${queryString}` : ''}`;

    const result = await axios.get(endpoint);
    return result.data;
  },

  // Get accounts by type
  getByType: async (type: string, search?: string) => {
    // Using the filter parameter to filter by account type
    const queryParams = new URLSearchParams();

    // Add filter for account type
    queryParams.append('filter', `type:${type}`);

    // Add additional search term if provided
    if (search && search.trim() !== '') {
      queryParams.append('searchBy', 'name,code');
      queryParams.append('search', search);
    }

    // Set default limit and page
    queryParams.append('limit', '100');
    queryParams.append('page', '1');

    // Add sort by createdAt DESC
    queryParams.append('sortBy', 'createdAt:DESC');

    const endpoint = `/accounting?${queryParams.toString()}`;

    const result = await axios.get(endpoint);
    return result.data;
  },

  // Get a specific account by ID
  getOne: async (accountId: string) => {
    const result = await axios.get(`/accounting/accounts/${accountId}`);
    return result.data;
  },

  // Get descendants of a specific account
  getDescendants: async (accountId: string) => {
    const result = await axios.get(`/accounting/accounts/${accountId}/descendants`);
    return result.data;
  },

  // Create a new OHADA-compliant account
  create: async (data: accountPayload) => {
    const result = await axios.post('/accounting/accounts', data);
    return result.data;
  },

  // Update an existing account
  update: async (accountId: string, data: accountUpdatePayload) => {
    const result = await axios.put(`/accounting/accounts/${accountId}`, data);
    return result.data;
  },

  // Delete an account
  delete: async (accountId: string) => {
    const result = await axios.delete(`/accounting/accounts/${accountId}`);
    return result.data;
  },

  // Get account balance
  getBalance: async (accountId: string) => {
    const result = await axios.get(`/accounting/ledger/account/${accountId}/balance`);
    return result.data;
  },

  // Get account transactions (ledger view)
  getTransactions: async (accountId: string) => {
    const result = await axios.get(`/accounting/ledger/account/${accountId}/transactions`);
    return result.data;
  },

  // Get account balance for a specific period
  getPeriodBalance: async (
    accountId: string,
    startDate: string,
    endDate: string
  ) => {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    }).toString();

    const result = await axios.get(
      `/accounting/ledger/account/${accountId}/period-balance?${queryParams}`
    );
    return result.data;
  },
};
