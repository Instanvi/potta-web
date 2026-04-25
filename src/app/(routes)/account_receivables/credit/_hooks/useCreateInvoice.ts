import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';
import { IInvoicePayload } from '../_utils/valididation';

const useCreateInvoice = (user_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-invoicing'],
    mutationFn: (data: IInvoicePayload) => invoiceApi.create(data, user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
    },
  });
};

export default useCreateInvoice;
