import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/app/(routes)/_shared/format';
import { employeeApi, employeeKeys } from '../utils/api';
import type { CreateEmployeePayload } from '../utils/validations';

const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-payroll-employee'],
    mutationFn: (data: CreateEmployeePayload) => employeeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      toast.success('Employee created');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to create employee')),
  });
};

export default useCreateEmployee;
