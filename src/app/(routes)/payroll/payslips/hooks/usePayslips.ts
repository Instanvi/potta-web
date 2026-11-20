import { useQuery } from '@tanstack/react-query';
import { payslipsApi } from '../utils/api';

export function usePayslips(filter: any) {
  return useQuery({
    queryKey: ['payslips', filter],
    queryFn: () => payslipsApi.filter(filter),
  });
}
