
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { vouchersApi } from '../_utils/api';
import { Filter } from '../_utils/types';


export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-voucher'],
    mutationFn: (data: any) => vouchersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-vouchers'] });
    },
  });
};

export const useGetAllVouchers = (filter: Filter) => {
    return useQuery({
        queryKey: ['get-all-vouchers', filter.page, filter.limit],
        queryFn: () => vouchersApi.getAll(filter),
      });
};

export const useGetOneVoucher = (voucher_id:string) => {
    return useQuery({
        queryKey: ['get-one-voucher', voucher_id],
        queryFn: () => vouchersApi.getOne(voucher_id),
      });
};


export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-voucher'],
    mutationFn: (voucher_id: string) => vouchersApi.delete(voucher_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-vouchers'] });
    },
  });
};
