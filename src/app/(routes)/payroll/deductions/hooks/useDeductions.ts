import { useQuery } from '@tanstack/react-query';
import { deductionsApi } from '../utils/api';
import { Filter } from '../utils/types';

export function useDeductions(filter: Filter) {
  return useQuery({
    queryKey: ['deductions', filter],
    queryFn: () => deductionsApi.getAll(filter),
  });
} 