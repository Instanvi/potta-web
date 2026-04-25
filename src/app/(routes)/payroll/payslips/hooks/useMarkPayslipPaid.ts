import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payslipsApi } from '../utils/api';

export function useMarkPayslipPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payslipsApi.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
}
