import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountApi } from '../utils/api';

export function useReactivateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bankAccountApi.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}
