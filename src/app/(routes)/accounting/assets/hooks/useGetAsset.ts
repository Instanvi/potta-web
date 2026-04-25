import { useQuery } from '@tanstack/react-query';
import { assetApi } from '../utils/api';

export function useGetAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetApi.getOne(id),
    enabled: !!id,
  });
}
