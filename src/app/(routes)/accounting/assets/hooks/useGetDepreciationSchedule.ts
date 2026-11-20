import { useQuery } from '@tanstack/react-query';
import { assetApi } from '../utils/api';

export function useGetDepreciationSchedule(id: string) {
  return useQuery({
    queryKey: ['asset-depreciation-schedule', id],
    queryFn: () => assetApi.getDepreciationSchedule(id),
    enabled: !!id,
  });
}
