import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../utils/api';
import { Budget, RecurrenceType } from '../utils/types';

interface CreateBudgetData {
  name: string;
  description?: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  organizationId: string;
  branchId: string;
  policies: string[];
  recurrenceType?: RecurrenceType;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
}

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createBudget,
    isPending: loading,
    error,
    data: createdBudget,
  } = useMutation({
    mutationFn: async (budgetData: CreateBudgetData) => {
      const result = await budgetsApi.createBudget(budgetData, {
        organizationId: budgetData.organizationId,
        branchId: budgetData.branchId,
      });
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch budgets query
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  return {
    createBudget,
    loading,
    error,
    createdBudget,
  };
};
