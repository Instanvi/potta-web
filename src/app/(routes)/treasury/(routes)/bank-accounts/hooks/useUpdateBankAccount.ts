import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankAccountApi, BankAccountPayload } from '../utils/api';

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BankAccountPayload>;
    }) => bankAccountApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}
