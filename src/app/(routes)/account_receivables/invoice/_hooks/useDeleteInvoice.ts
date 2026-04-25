import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-invoicing'],
    mutationFn: invoiceApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing-stats'] });
    },
  });
};

export default useDeleteInvoice;
