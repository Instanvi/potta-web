import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


export default function useGetOneInvoice(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/invoice/details/${invoiceId}`);
      return response.data;
    },
    enabled: !!invoiceId, // Only fetch when invoiceId is provided
  });
}