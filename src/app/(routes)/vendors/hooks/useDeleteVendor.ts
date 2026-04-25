import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../utils/api';

const useDeleteVendor= ( ) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-vendor'],
    mutationFn:(vendor_id:string) => vendorApi.delete(vendor_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-vendors'] });
    },
  });
};

export default useDeleteVendor;
