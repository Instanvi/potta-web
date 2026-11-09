import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CustomerFilter, CustomerResponse } from '../utils/types';
import { customerApi } from '../utils/api';

const useGetAllCustomers = (filter: CustomerFilter) => {
  return useQuery<CustomerResponse>({
    queryKey: ['get-all-customers', filter],
    queryFn: () => customerApi.getAll(filter),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // Optional: Data will be fresh for 5 minutes, adjust as needed
    refetchOnWindowFocus: false, // Optional: Prevents refetching when window is focused
  });
};

export default useGetAllCustomers;
