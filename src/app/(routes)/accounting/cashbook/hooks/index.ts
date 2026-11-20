import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../_shared/format';
import { cashbookApi, cashbookKeys } from '../utils/api';
import { CashbookEntryPayload, CashbookFilter } from '../utils/types';

export const useCashbookEntries = (filter: CashbookFilter) =>
  useQuery({
    queryKey: cashbookKeys.list(filter),
    queryFn: () => cashbookApi.list(filter),
  });

export const useCashAccounts = () =>
  useQuery({
    queryKey: cashbookKeys.cashAccounts(),
    queryFn: () => cashbookApi.cashAccounts(),
    staleTime: 5 * 60 * 1000,
  });

const useInvalidateCashbook = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: cashbookKeys.all });
    queryClient.invalidateQueries({ queryKey: ['ledgers'] });
  };
};

export const useCreateCashbookEntry = () => {
  const invalidate = useInvalidateCashbook();
  return useMutation({
    mutationFn: (data: CashbookEntryPayload) => cashbookApi.create(data),
    onSuccess: () => {
      invalidate();
      toast.success('Cashbook entry recorded');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to record entry')),
  });
};

export const useUpdateCashbookEntry = () => {
  const invalidate = useInvalidateCashbook();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CashbookEntryPayload> }) =>
      cashbookApi.update(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Cashbook entry updated');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to update entry')),
  });
};

export const useDeleteCashbookEntry = () => {
  const invalidate = useInvalidateCashbook();
  return useMutation({
    mutationFn: (id: string) => cashbookApi.delete(id),
    onSuccess: () => {
      invalidate();
      toast.success('Cashbook entry deleted and reversed');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to delete entry')),
  });
};
