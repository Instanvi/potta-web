import { useMutation } from '@tanstack/react-query';
import { payslipsApi } from '../utils/api';

export function useExportPayslip() {
  return useMutation({
    mutationFn: (id: string) => payslipsApi.export(id),
  });
}
