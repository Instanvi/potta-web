import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountApi } from '../utils/api';

export function useDeactivateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bankAccountApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}
