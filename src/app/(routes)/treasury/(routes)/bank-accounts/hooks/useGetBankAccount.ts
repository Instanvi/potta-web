import { useQuery } from '@tanstack/react-query';
import { bankAccountApi } from '../utils/api';

export function useGetBankAccount(id: string) {
  return useQuery({
    queryKey: ['bank-account', id],
    queryFn: () => bankAccountApi.getOne(id),
    enabled: !!id,
  });
}
