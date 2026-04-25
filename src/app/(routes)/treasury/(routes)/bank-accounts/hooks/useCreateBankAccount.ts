import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountApi, BankAccountPayload } from '../utils/api';

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bankAccountApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}
