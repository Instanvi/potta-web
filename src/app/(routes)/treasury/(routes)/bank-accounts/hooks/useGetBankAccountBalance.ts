import { useQuery } from '@tanstack/react-query';
import { bankAccountApi } from '../utils/api';

export function useGetBankAccountBalance(id: string) {
  return useQuery({
    queryKey: ['bank-account-balance', id],
    queryFn: () => bankAccountApi.getBalance(id),
    enabled: !!id,
  });
}
