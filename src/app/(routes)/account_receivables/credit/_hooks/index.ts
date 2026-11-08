import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../_shared/format';
import { creditNoteApi, creditNoteKeys } from '../_utils/api';
import {
  CreateCreditNotePayload,
  CreditNoteFilter,
  RefundPayload,
} from '../_utils/types';

export const useCreditNotes = (filter: CreditNoteFilter) =>
  useQuery({
    queryKey: creditNoteKeys.list(filter),
    queryFn: () => creditNoteApi.getAll(filter),
  });

export const useCreditNote = (creditNoteId: string) =>
  useQuery({
    queryKey: creditNoteKeys.detail(creditNoteId),
    queryFn: () => creditNoteApi.getOne(creditNoteId),
    enabled: !!creditNoteId,
  });

export const useCustomerInvoices = (customerId: string) =>
  useQuery({
    queryKey: creditNoteKeys.customerInvoices(customerId),
    queryFn: () => creditNoteApi.getCustomerInvoices(customerId),
    enabled: !!customerId,
  });

export const useCreateCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
      invoiceId,
    }: {
      payload: CreateCreditNotePayload;
      invoiceId?: string;
    }) => {
      const created = await creditNoteApi.create(payload);
      return invoiceId
        ? creditNoteApi.applyToInvoice(created.uuid, invoiceId)
        : created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.all });
      toast.success('Credit note created');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to create credit note')),
  });
};

export const useDeleteCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creditNoteId: string) => creditNoteApi.delete(creditNoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.all });
      toast.success('Credit note deleted');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to delete credit note')),
  });
};

export const useApproveCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (creditNoteId: string) => creditNoteApi.approve(creditNoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.all });
      toast.success('Credit note approved');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to approve credit note')),
  });
};

export const useRefundCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundPayload }) =>
      creditNoteApi.refund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.all });
      toast.success('Refund processed');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to process refund')),
  });
};

export const useApplyCreditNoteToInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, invoiceId }: { id: string; invoiceId: string }) =>
      creditNoteApi.applyToInvoice(id, invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditNoteKeys.all });
      queryClient.invalidateQueries({ queryKey: ['get-all-invoicing'] });
      toast.success('Credit note applied to invoice');
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, 'Failed to apply credit note')),
  });
};
