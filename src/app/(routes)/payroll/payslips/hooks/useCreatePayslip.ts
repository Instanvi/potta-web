import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payslipsApi } from '../utils/api';

export function useCreatePayslip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payslipsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips'] });
    },
  });
}
