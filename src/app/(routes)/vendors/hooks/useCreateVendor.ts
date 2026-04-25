import { vendorApi } from './../utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorPayload } from '../utils/validations';
import { toast } from 'react-hot-toast';

const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-vendor'],
    mutationFn: (data: VendorPayload) => vendorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-vendors'] });
    },
  });
};

export default useCreateVendor;
