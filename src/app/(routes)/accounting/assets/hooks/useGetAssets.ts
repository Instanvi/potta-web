import { useQuery } from '@tanstack/react-query';
import { assetApi } from '../utils/api';
import { AssetFilter } from '../utils/types';

export function useGetAssets(filter: AssetFilter = {}) {
  return useQuery({
    queryKey: ['assets', filter],
    queryFn: () => assetApi.getAll(filter),
  });
}
