import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Filter, ProductResponse } from '../utils/types';
import { posApi } from '../utils/api';

const useGetAllProducts = (filter: Filter) => {
  return useQuery<ProductResponse>({
    queryKey: ['get-all-product', filter],
    queryFn: () => posApi.getAll(filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};

export default useGetAllProducts;
