import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';


interface InvoiceParams {
  page: number;
  limit: number;
  customerId?: string;
}

export default function useGetAllInvoices(params: InvoiceParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await axios.get(`/invoice/customer/${params.customerId}`);
      return response.data;
    },
    enabled: !!params.customerId, // Only fetch when customerId is provided
  });
}