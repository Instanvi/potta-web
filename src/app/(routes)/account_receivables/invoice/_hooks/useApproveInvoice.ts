import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../_utils/api';

const useApproveInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => invoiceApi.approve(invoiceId),
    onSuccess: () => {
      // Invalidate and refetch invoice data
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
    },
    onError: (error) => {
      console.error('Error approving invoice:', error);
    },
  });
};

export default useApproveInvoice;
