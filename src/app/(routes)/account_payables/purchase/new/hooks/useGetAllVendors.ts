import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';


interface GetVendorsParams {
  page: number;
  limit: number;
}

export default function useGetAllVendors(params: GetVendorsParams) {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await axios.post(`/vendor/filter`, null, {
        params: {
          page: params.page,
          limit: params.limit,
        },
      });
      return response.data;
    },
  });
}