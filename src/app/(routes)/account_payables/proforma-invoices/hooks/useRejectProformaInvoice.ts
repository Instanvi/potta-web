import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'config/axios.config';

export const rejectProformaInvoice = async (id: string, reason?: string) => {
  const response = await axios.post(
    `/procurement/proforma-invoices/${id}/reject`,
    {
      rejectionReason: reason,
    }
  );
  return response.data;
};

const useRejectProformaInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectProformaInvoice(id, reason),
    onSuccess: () => {
      // Invalidate and refetch invoice data
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
    },
    onError: (error) => {
      console.error('Error rejecting proforma invoice:', error);
    },
  });
};

export default useRejectProformaInvoice;
