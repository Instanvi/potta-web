import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi } from '../_utils/api';

const useUpdateProductImages = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-product-images', productId],
    mutationFn: (images: string[]) => productApi.updateImages(productId, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
      queryClient.invalidateQueries({ queryKey: ['get-one-product', productId] });
      toast.success('Product images saved');
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to save images'),
  });
};

export default useUpdateProductImages;
