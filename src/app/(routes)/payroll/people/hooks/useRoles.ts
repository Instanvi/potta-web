import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await axios.post('/roles/filter', {
        limit: 100,
        sortBy: ['name:ASC'],
      });
      return response.data.data || [];
    },
  });
}
