import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../_utils/api';
import { ProductPayload } from '../_utils/validation';

const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-product'],
    mutationFn: (data: ProductPayload) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
    },
  });
};

export default useCreateProduct;
