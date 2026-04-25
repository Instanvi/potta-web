
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountPayload, accountUpdatePayload } from '../utils/validations';
import { accountsApi } from '../utils/api';
import { Filters } from '../../pos/sales/utils/types';


export const useCreatAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-account'],
    mutationFn: (data: accountPayload) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-accounts'] });
    },
  });
};

export const useGetAllAccounts = (filter: Filters) => {
    return useQuery({
        queryKey: ['get-all-accounts', filter.page, filter.limit],
        queryFn: () => accountsApi.getAll(filter),
      });
};

export const useGetAccount = (account_id:string) => {
    return useQuery({
        queryKey: ['get-one-account', account_id],
        queryFn: () => accountsApi.getOne(account_id),
      });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['update-account'],
    mutationFn: ({ account_id, data }: { account_id: string; data: accountUpdatePayload }) => accountsApi.update(account_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-accounts'] });
    },
  });
};
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-account'],
    mutationFn: (account_id: string) => accountsApi.delete(account_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-accounts'] });
    },
  });
};
export const useGetOhada = (name: string) => {
  return useQuery({
    queryKey: ['get-ohada', name],
    queryFn: () => accountsApi.getOhada(name),
  });
};
export const useSearchOhada = (name: string, code: string | number) => {
  return useQuery({
    queryKey: ['search-ohada', name, code],
    queryFn: () => accountsApi.SearchOhada(name, code),
  });
};