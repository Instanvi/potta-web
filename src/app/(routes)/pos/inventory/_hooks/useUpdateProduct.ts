import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../_utils/api';
import { UpdateProductPayload } from '../_utils/validation';

const useUpdateProduct = (product_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-product'],
    mutationFn: (data: UpdateProductPayload) => productApi.update( product_id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] }),
  });
};

export default useUpdateProduct;
