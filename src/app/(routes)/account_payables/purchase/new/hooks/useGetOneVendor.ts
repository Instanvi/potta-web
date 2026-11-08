import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';


export default function useGetOneVendor(vendorId: string) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const response = await axios.get(`/vendor/details/${vendorId}`);
      return response.data;
    },
    enabled: !!vendorId, // Only run the query if vendorId exists
  });
}