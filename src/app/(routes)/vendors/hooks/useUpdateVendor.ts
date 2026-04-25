import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../utils/api';
import { UpdateVendorPayload } from '../utils/validations';

const useUpdateVendor = (vendor_id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-vendor'],
    mutationFn: (data: UpdateVendorPayload) => vendorApi.update(vendor_id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['get-all-vendors'] }),
  });
};

export default useUpdateVendor;
