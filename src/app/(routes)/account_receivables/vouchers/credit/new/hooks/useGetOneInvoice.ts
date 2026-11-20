import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';


export default function useGetOneInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await axios.get(`/invoice/details/${invoiceId}`);
      return response.data;
    },
    enabled: !!invoiceId, // Only fetch when invoiceId is provided
  });
}