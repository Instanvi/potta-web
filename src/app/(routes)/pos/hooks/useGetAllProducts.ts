import { useQuery } from '@tanstack/react-query';
import { Filter, ProductResponse } from '../utils/types';
import { posApi } from '../utils/api';



const useGetAllProducts = (filter: Filter,) => {
  return useQuery<ProductResponse>({
    queryKey: ['get-all-product', filter.page, filter.limit],
    queryFn: () => posApi.getAll( filter),
    staleTime: 1000 * 60 * 5, // Optional: Data will be fresh for 5 minutes, adjust as needed
    refetchOnWindowFocus: false, // Optional: Prevents refetching when window is focused
  });
};

export default useGetAllProducts;
