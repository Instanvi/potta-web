import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../_shared/format';
import { TaxPayload, taxApi, taxKeys } from '../utils/api';

export const useTaxes = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: taxKeys.list(params),
    queryFn: () => taxApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useCreateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaxPayload) => taxApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success('Tax created');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to create tax')),
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaxPayload> }) =>
      taxApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success('Tax updated');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to update tax')),
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taxApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success('Tax deleted');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to delete tax')),
  });
};

export const useImportTaxesCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => taxApi.importCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxKeys.all });
      toast.success('Taxes imported');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to import taxes')),
  });
};
