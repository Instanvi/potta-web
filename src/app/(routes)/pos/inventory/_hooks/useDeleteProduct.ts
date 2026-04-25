import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../_utils/api';

const useDeleteProduct= () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-product'],
    mutationFn:(product_id: string) => productApi.delete( product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
    },
  });
};

export default useDeleteProduct;
