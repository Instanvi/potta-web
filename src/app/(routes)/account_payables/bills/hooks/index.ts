import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../../../_shared/format';
import { billKeys, billsApi } from '../utils/api';
import { BillFilter, CreateBillPayload, PayBillPayload } from '../utils/types';

export const useBills = (filter: BillFilter) =>
  useQuery({
    queryKey: billKeys.list(filter),
    queryFn: () => billsApi.list(filter),
    placeholderData: (previous) => previous,
  });

export const useBill = (billId: string | null) =>
  useQuery({
    queryKey: billKeys.detail(billId ?? ''),
    queryFn: () => billsApi.get(billId as string),
    enabled: !!billId,
  });

const useInvalidateBills = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: billKeys.all });
    queryClient.invalidateQueries({ queryKey: ['ap-dashboard'] });
  };
};

export const useCreateBill = () => {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: (data: CreateBillPayload) => billsApi.create(data),
    onSuccess: (bill) => {
      invalidate();
      toast.success(`Bill ${bill.code} created as draft`);
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to create bill')),
  });
};

export const useApproveBill = () => {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: ({ id, expenseAccountCode }: { id: string; expenseAccountCode?: string }) =>
      billsApi.approve(id, expenseAccountCode),
    onSuccess: () => {
      invalidate();
      toast.success('Bill approved and posted to the books');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to approve bill')),
  });
};

export const useRejectBill = () => {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => billsApi.reject(id, reason),
    onSuccess: () => {
      invalidate();
      toast.success('Bill rejected');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to reject bill')),
  });
};

export const usePayBill = () => {
  const invalidate = useInvalidateBills();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayBillPayload }) => billsApi.pay(id, data),
    onSuccess: () => {
      invalidate();
      toast.success('Payment recorded');
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Failed to record payment')),
  });
};
