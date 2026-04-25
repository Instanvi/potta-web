import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ptoApi } from '../utils/ptoApi';

// Hook for getting a specific PTO policy
export const useGetPTOPolicy = () => {
  return useMutation({
    mutationFn: (id: string) => {
      console.log('Getting PTO policy with ID:', id);
      return ptoApi.getPTOPolicy(id);
    },
  });
};

// Hook for accruing leave
export const useAccrueLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => 
      ptoApi.accrueLeave(id, amount),
    onSuccess: () => {
      // Invalidate and refetch PTO policies after successful accrual
      queryClient.invalidateQueries({ queryKey: ['ptoPolicies'] });
    },
  });
};

// Hook for requesting leave
export const useRequestLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      days, 
      start_date, 
      end_date, 
      reason 
    }: { 
      id: string; 
      days: number; 
      start_date: string; 
      end_date: string; 
      reason: string 
    }) => 
      ptoApi.requestLeave(id, { days, start_date, end_date, reason }),
    onSuccess: () => {
      // Invalidate and refetch PTO policies after successful request
      queryClient.invalidateQueries({ queryKey: ['ptoPolicies'] });
    },
  });
};

// Hook for resetting PTO cycle
export const useResetPTOCycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ptoApi.resetPTOCycle(id),
    onSuccess: () => {
      // Invalidate and refetch PTO policies after successful reset
      queryClient.invalidateQueries({ queryKey: ['ptoPolicies'] });
    },
  });
};