import { useQuery } from '@tanstack/react-query';
import {  Customer, CustomerFilter, CustomerResponse } from '../utils/types';
import { customerApi } from '../utils/api';
import { AxiosResponse } from 'axios';


const useGetAllCustomers = (filter: CustomerFilter) => {
  return useQuery<CustomerResponse> ({
    queryKey: ['get-all-customers', filter.page, filter.limit], // Dynamic queryKey based on page and limit
    queryFn: () => customerApi.getAll(filter),

    staleTime: 1000 * 60 * 5, // Optional: Data will be fresh for 5 minutes, adjust as needed
    refetchOnWindowFocus: false, // Optional: Prevents refetching when window is focused
  });
};

export default useGetAllCustomers;
