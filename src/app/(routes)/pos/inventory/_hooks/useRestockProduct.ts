import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../_utils/api';

interface RestockPayload {
  productId: string;
  quantity: number;
  userId: string;
}

const useRestockProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['restock-product'],
    mutationFn: (data: RestockPayload) => productApi.restock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
    },
  });
};

export default useRestockProduct;
