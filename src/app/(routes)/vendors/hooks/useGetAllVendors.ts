import { useQuery } from '@tanstack/react-query';
import {  Vendor, VendorFilter, VendorResponse } from '../utils/types';
import { vendorApi } from '../utils/api';
import { AxiosResponse } from 'axios';


const useGetAllVendors = (filter: VendorFilter) => {
  return useQuery<VendorResponse> ({
    queryKey: ['get-all-vendors', filter.page, filter.limit], // Dynamic queryKey based on page and limit
    queryFn: () => vendorApi.getAll(filter),
  
    staleTime: 1000 * 60 * 5, // Optional: Data will be fresh for 5 minutes, adjust as needed
    refetchOnWindowFocus: false, // Optional: Prevents refetching when window is focused
  });
};

export default useGetAllVendors;
