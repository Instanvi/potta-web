import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useSendInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data?: { channel?: 'email' | 'sms'; to?: string; phone?: string; message?: string };
    }) => invoiceApi.send(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['get-one-invoice'] });
    },
  });
};

export default useSendInvoice;
