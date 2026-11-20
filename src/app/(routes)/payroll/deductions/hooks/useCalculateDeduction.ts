import { useMutation } from '@tanstack/react-query';
import { deductionsApi } from '../utils/api';

export function useCalculateDeduction() {
  return useMutation({
    mutationFn: ({ id, salary }: { id: string; salary: number }) =>
      deductionsApi.calculate(id, salary),
  });
}
