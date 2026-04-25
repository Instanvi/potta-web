import axios from 'config/axios.config';
import { BudgetFilter } from '../hooks/useBudgets';

export const budgetsApi = {
  getCurrentUserId: () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userId') || '';
  },

  // Get all budgets with pagination and filtering
  getBudgets: async (filter: BudgetFilter) => {
    const queryParams = new URLSearchParams();

    // Add pagination params
    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());

    // Add search param
    if (filter.search) queryParams.append('search', filter.search);

    // Add sorting
    if (filter.sortBy && filter.sortOrder) {
      queryParams.append('sortBy', `${filter.sortBy}:${filter.sortOrder}`);
    }

    // Add status filter if provided
    if (filter.status) {
      queryParams.append('filter', `status:$eq:${filter.status}`);
    }

    const result = await axios.get(`/budgets?${queryParams.toString()}`);
    return result.data;
  },

  // Get archived budgets with pagination and filtering
  getArchivedBudgets: async (filter: BudgetFilter) => {
    const queryParams = new URLSearchParams();

    // Add pagination params
    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());

    // Add search param
    if (filter.search) queryParams.append('search', filter.search);

    // Add sorting
    if (filter.sortBy && filter.sortOrder) {
      queryParams.append('sortBy', `${filter.sortBy}:${filter.sortOrder}`);
    }

    const result = await axios.get(
      `/budgets/archived?${queryParams.toString()}`
    );
    return result.data;
  },

  // Get a budget by ID
  getBudget: async (budgetId: string, options = {}) => {
    const result = await axios.get(`/budgets/${budgetId}`);
    return result.data;
  },

  // Create a new budget
  createBudget: async (data: any, options = {}) => {
    const result = await axios.post('/budgets', data);
    return result.data;
  },

  // Update a budget
  updateBudget: async (budgetId: string, data: any, options = {}) => {
    const result = await axios.put(`/budgets/${budgetId}`, data);
    return result.data;
  },

  // Approve a budget
  approveBudget: async (budgetId: string, approverId: string, options = {}) => {
    const result = await axios.post(`/budgets/${budgetId}/approve`, {
      budgetId,
      approverId,
    });
    return result.data;
  },

  // Archive a budget (soft delete)
  archiveBudget: async (budgetId: string, options = {}) => {
    const result = await axios.delete(`/budgets/${budgetId}`);
    return result.data;
  },

  // Fund a budget
  fundBudget: async (
    budgetId: string,
    fundingData: {
      amount: number;
      cashOrBankAccountId: string;
      budgetFundingEquityAccountId: string;
    },
    options = {}
  ) => {
    const result = await axios.post(`/budgets/${budgetId}/fund`, {
      budgetId,
      amount: fundingData.amount,
      cashOrBankAccountId: fundingData.cashOrBankAccountId,
      budgetFundingEquityAccountId: fundingData.budgetFundingEquityAccountId,
    });
    return result.data;
  },
};
