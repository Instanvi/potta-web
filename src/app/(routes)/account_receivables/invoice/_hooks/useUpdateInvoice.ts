import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useUpdateInvoice = (invoice_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-invoicing'],
    mutationFn: (data) => invoiceApi.update(invoice_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing-stats'] });
    },
  });
};

export default useUpdateInvoice;
