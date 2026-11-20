import { useQuery } from '@tanstack/react-query';
import axios from 'config/axios.config';

interface OrgRole {
  id: string;
  name: string;
  organizationId: string;
  branchId: string | null;
  permissions: any;
}

export const useOrgRoles = () => {
  return useQuery<OrgRole[]>({
    queryKey: ['org-roles'],
    queryFn: async () => {
      const response = await axios.get('/whoami/org-roles');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 