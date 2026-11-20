import { useQuery } from '@tanstack/react-query';
import { productCategoryApi } from '../_utils/api';

const useGetAllProductCategories = (params = {}) => {
  return useQuery({
    queryKey: ['get-all-product-category', params],
    queryFn: () => productCategoryApi.getAll(params),
  });
};

export default useGetAllProductCategories;
