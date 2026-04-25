import { useQuery } from '@tanstack/react-query';
import { bankAccountApi } from '../utils/api';

export function useGetBankAccounts(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['bank-accounts', params],
    queryFn: () => bankAccountApi.getAll(params),
  });
}
