import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '../utils/api';
import { Vendor } from '../utils/types';

const useGetOneVendor = (vendor_id: string) => {
  return useQuery({
    queryKey: ['get-one-vendor', vendor_id],
    queryFn: async () => {
      const response = await vendorApi.getOne(vendor_id);
      return response as unknown as Vendor;
    },
    enabled: !!vendor_id, // Only fetch if vendor_id is provided
  });
};

export default useGetOneVendor;
