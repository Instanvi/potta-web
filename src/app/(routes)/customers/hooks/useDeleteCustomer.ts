import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../utils/api';

const useDeleteCustomer= ( ) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-customer'],
    mutationFn:(customer_id:string) => customerApi.delete(customer_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-customers'] });
    },
  });
};

export default useDeleteCustomer;
