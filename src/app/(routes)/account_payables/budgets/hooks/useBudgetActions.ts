import { useState } from 'react';
import { budgetsApi } from '../utils/api';
import { Budget } from '../utils/types';

interface BudgetActionOptions {
  organizationId?: string;
  branchId?: string;
}

export const useBudgetActions = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [actionResult, setActionResult] = useState<any>(null);

  // Approve a budget
  const approveBudget = async (
    budgetId: string,
    options: BudgetActionOptions = {}
  ) => {
    try {
      setLoading('approve');
      setError(null);

      const approverId = budgetsApi.getCurrentUserId();
      const result = await budgetsApi.approveBudget(budgetId, approverId);

      setActionResult(result);
      return result;
    } catch (err) {
      console.error('Error approving budget:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  // Archive a budget
  const archiveBudget = async (
    budgetId: string,
    options: BudgetActionOptions = {}
  ) => {
    try {
      setLoading('archive');
      setError(null);

      const result = await budgetsApi.archiveBudget(budgetId);

      setActionResult(result);
      return result;
    } catch (err) {
      console.error('Error archiving budget:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  // Fund a budget
  const fundBudget = async (
    budgetId: string,
    fundingData: {
      amount: number;
      cashOrBankAccountId: string;
      budgetFundingEquityAccountId: string;
    },
    options: BudgetActionOptions = {}
  ) => {
    try {
      setLoading('fund');
      setError(null);

      const result = await budgetsApi.fundBudget(budgetId, fundingData);

      setActionResult(result);
      return result;
    } catch (err) {
      console.error('Error funding budget:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  // Get a specific budget by ID
  const getBudget = async (
    budgetId: string,
    options: BudgetActionOptions = {}
  ) => {
    try {
      setLoading('fetch');
      setError(null);

      const result = await budgetsApi.getBudget(budgetId);

      setActionResult(result);
      return result;
    } catch (err) {
      console.error('Error fetching budget:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  return {
    approveBudget,
    archiveBudget,
    fundBudget,
    getBudget,
    loading,
    error,
    actionResult,
  };
};
