import { customerApi } from '../utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerPayload } from '../utils/validations';


const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-customer'],
    mutationFn: (data: CustomerPayload) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-customers'] });
    },
  });
};

export default useCreateCustomer;
