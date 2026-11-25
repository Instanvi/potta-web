import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../_shared/format';
import {
  OrgPaymentMethodPayload,
  PaymentMethodListParams,
  paymentMethodApi,
  paymentMethodKeys,
} from '../utils/api';

export const usePaymentMethods = (
  params: PaymentMethodListParams = { page: 1, limit: 100 },
) =>
  useQuery({
    queryKey: paymentMethodKeys.list(params),
    queryFn: () => paymentMethodApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useSeedPaymentMethods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => paymentMethodApi.seedDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toast.success('Default payment methods ready');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to seed payment methods')),
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrgPaymentMethodPayload) => paymentMethodApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toast.success('Payment method created');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to create payment method')),
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrgPaymentMethodPayload> }) =>
      paymentMethodApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toast.success('Payment method updated');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to update payment method')),
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentMethodApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
      toast.success('Payment method deleted');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to delete payment method')),
  });
};
