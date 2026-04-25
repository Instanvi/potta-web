import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../utils/api';
import { UpdateCustomerPayload } from '../utils/validations';

const useUpdateCustomer = (customer_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-customer'],
    mutationFn: (data: UpdateCustomerPayload) => customerApi.update(customer_id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['get-all-customer'] }),
  });
};

export default useUpdateCustomer;
