import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productApi } from '../_utils/api';
import type { Filter } from '../_utils/types';

export const useGetAllProducts = (filter: Partial<Filter> = {}) => {
  const params: Filter = { page: 1, limit: 100, ...filter };
  return useQuery({
    queryKey: ['get-all-product', params],
    queryFn: () => productApi.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
};

export default useGetAllProducts;
