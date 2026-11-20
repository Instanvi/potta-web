import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


export default function useGetOneVendor(vendorId: string) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendors/${vendorId}`);
      return response.data;
    },
    enabled: !!vendorId, // Only run the query if vendorId exists
  });
}