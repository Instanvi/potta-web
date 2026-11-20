import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useRemoveInvoiceLineItem = (invoice_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['remove-invoicing-line-item'],
    mutationFn: (lineItemId: string) =>
      invoiceApi.removeLineItem(invoice_id, lineItemId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] }),
  });
};

export default useRemoveInvoiceLineItem;
