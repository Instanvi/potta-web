import { useQuery } from '@tanstack/react-query';
import { budgetsApi } from '../utils/api';

interface UseGetBudgetTransactionsProps {
  budgetId: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}

export const useGetBudgetTransactions = ({
  budgetId,
  sortBy,
  limit = 100,
  page = 1,
}: UseGetBudgetTransactionsProps) => {
  return useQuery({
    queryKey: ['budget-transactions', budgetId, sortBy, limit, page],
    queryFn: () =>
      budgetsApi.getBudgetTransactions(budgetId, { sortBy, limit, page }),
    enabled: !!budgetId,
  });
};
