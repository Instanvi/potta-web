import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useAddInvoiceLineItem = (invoice_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['add-invoicing-line-item'],
    mutationFn: (lineItems: unknown[]) =>
      invoiceApi.addLineItems(invoice_id, lineItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing-stats'] });
    },
  });
};

export default useAddInvoiceLineItem;
