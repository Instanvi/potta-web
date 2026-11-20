import { useQuery } from '@tanstack/react-query';
import { ptoApi } from '../utils/ptoApi';

export interface PTOPolicy {
  uuid: string;
  type: string;
  total_entitled_days: string;
  days_remaining: string;
  status: string;
}

export const useFetchPTOPolicies = () => {
  return useQuery({
    queryKey: ['ptoPolicies'],
    queryFn: async () => {
      const response = await ptoApi.getPTOPolicies();
      return response.data as PTOPolicy[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};