import { useQuery } from '@tanstack/react-query';
import { ptoApi } from '../utils/ptoApi';
import { PaidTimeOffItem } from '../utils/types';

export const useFetchPTOs = () => {
  return useQuery({
    queryKey: ['ptos'],
    queryFn: async () => {
      const response = await ptoApi.filterPTOs();
      return response.data as PaidTimeOffItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};