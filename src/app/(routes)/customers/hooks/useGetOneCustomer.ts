"use client"
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '../utils/api';
import { Customer } from '../utils/types';

const useGetOneCustomer = (customer_id: string) => {
  return useQuery({
    queryKey: ['get-one-customer', customer_id],
    queryFn: async () => {
      const response = await customerApi.getOne(customer_id);
      return response as unknown as Customer;
    }
  });
};

export default useGetOneCustomer;
