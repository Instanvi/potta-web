import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deductionsApi } from '../utils/api';
import { DecductionProps } from '../utils/types';

export function useCreateDeduction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DecductionProps) => deductionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] });
    },
  });
} 