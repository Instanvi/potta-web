import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoiceApi } from '../_utils/api';
import { RecordInvoicePaymentPayload } from '../_utils/types';

const usePayInvoice = (invoiceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['pay-invoice', invoiceId],
    mutationFn: (data: RecordInvoicePaymentPayload) =>
      invoiceApi.pay(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-one-invoicing', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing-stats'] });
      toast.success('Payment recorded');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to record payment');
    },
  });
};

export default usePayInvoice;
