import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';

interface Employee {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  profilePicture?: string;
  phone?: string;
}

export const useEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.post('/employees/filter', {
        limit: 100,
        sortBy: ['firstName:ASC'],
      });
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 