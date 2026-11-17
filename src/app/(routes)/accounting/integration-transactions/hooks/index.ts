import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../_shared/format';
import { integrationTransactionKeys, integrationTransactionsApi } from '../utils/api';
import { AcceptPayload, IntegrationTransactionFilter } from '../utils/types';

export const useIntegrationTransactions = (filter: IntegrationTransactionFilter) =>
  useQuery({
    queryKey: integrationTransactionKeys.list(filter),
    queryFn: () => integrationTransactionsApi.list(filter),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: integrationTransactionKeys.all });
    queryClient.invalidateQueries({ queryKey: ['journals'] });
  };
};

export const useAcceptIntegrationTransaction = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: AcceptPayload }) =>
      integrationTransactionsApi.accept(id, body),
    onSuccess: () => {
      invalidate();
      toast.success('Transaction accepted and journal posted');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to accept transaction')),
  });
};

export const useExcludeIntegrationTransaction = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => integrationTransactionsApi.exclude(id),
    onSuccess: () => {
      invalidate();
      toast.success('Transaction excluded');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to exclude transaction')),
  });
};
