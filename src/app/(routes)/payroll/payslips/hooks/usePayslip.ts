import { useQuery } from '@tanstack/react-query';
import { payslipsApi } from '../utils/api';

export function usePayslip(id: string) {
  return useQuery({
    queryKey: ['payslip', id],
    queryFn: () => payslipsApi.getById(id),
    enabled: !!id,
  });
} 