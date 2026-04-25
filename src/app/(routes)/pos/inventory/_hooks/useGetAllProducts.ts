import { useQuery } from '@tanstack/react-query';
import { productApi } from '../_utils/api';

export const useGetAllProducts = () => {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const response = await productApi.getAllProducts();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default useGetAllProducts;
