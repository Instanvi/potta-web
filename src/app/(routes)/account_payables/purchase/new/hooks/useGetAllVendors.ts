import { useQuery } from '@tanstack/react-query';
import axios from 'axios';


interface GetVendorsParams {
  page: number;
  limit: number;
}

export default function useGetAllVendors(params: GetVendorsParams) {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/vendors`, {
        params: {
          page: params.page,
          limit: params.limit,
        },
      });
      return response.data;
    },
  });
}