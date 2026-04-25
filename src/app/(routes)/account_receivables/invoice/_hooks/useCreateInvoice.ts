import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';
import { IInvoicePayload } from '../_utils/valididation';

const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-invoicing'],
    mutationFn: (data: IInvoicePayload) => invoiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing-stats'] });
    },
  });
};

export default useCreateInvoice;
