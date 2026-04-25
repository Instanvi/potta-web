import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'config/axios.config';

export const approveProformaInvoice = async (id: string) => {
  const response = await axios.post(
    `/procurement/proforma-invoices/${id}/approve`
  );
  return response.data;
};

const useApproveProformaInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveProformaInvoice(id),
    onSuccess: () => {
      // Invalidate and refetch invoice data
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
    },
    onError: (error) => {
      console.error('Error approving proforma invoice:', error);
    },
  });
};

export default useApproveProformaInvoice;
