import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productCategoryApi } from '../_utils/api';
import { ProductCategoryPayload } from '../_utils/validation';

const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-product-category'],
    mutationFn: (data: ProductCategoryPayload) =>
      productCategoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product-category'] });
    },
  });
};

export default useCreateProductCategory;
