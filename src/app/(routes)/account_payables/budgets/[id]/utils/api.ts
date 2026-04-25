import axios from 'config/axios.config';

export const budgetsApi = {
  getBudgetTransactions: async (
    budgetId: string,
    params: { sortBy?: string; limit?: number; page?: number } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    const result = await axios.get(
      `/budgets/${budgetId}/transactions?${queryParams.toString()}`
    );
    return result.data;
  },
};
