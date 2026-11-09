import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payImportApi } from '../_utils/payImportApi';

const useImportFromPay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['import-products-from-pay'],
    mutationFn: (targetLocationId?: string) => payImportApi.importFromPay(targetLocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-product'] });
      queryClient.invalidateQueries({ queryKey: ['get-one-product'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-product-category'] });
    },
  });
};

export default useImportFromPay;
