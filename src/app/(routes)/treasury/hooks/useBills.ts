import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  billsApi,
  BillsFilter,
  Bill,
  PayBillRequest,
} from '../utils/bills-api';

// Query keys
export const BILLS_QUERY_KEYS = {
  lists: (filter?: BillsFilter) => ['bills', 'list', filter],
  detail: (uuid: string) => ['bills', 'detail', uuid],
};

// Hooks for bills
export const useGetBills = (filter?: BillsFilter) => {
  return useQuery({
    queryKey: BILLS_QUERY_KEYS.lists(filter),
    queryFn: () => billsApi.getAll(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetBill = (uuid: string) => {
  return useQuery({
    queryKey: BILLS_QUERY_KEYS.detail(uuid),
    queryFn: () => billsApi.getById(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useApproveBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => billsApi.approve(uuid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: BILLS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: BILLS_QUERY_KEYS.detail(data.uuid),
      });
      toast.success('Bill approved successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to approve bill';
      toast.error(errorMessage);
    },
  });
};

export const useRejectBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => billsApi.reject(uuid),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: BILLS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: BILLS_QUERY_KEYS.detail(data.uuid),
      });
      toast.success('Bill rejected successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to reject bill';
      toast.error(errorMessage);
    },
  });
};

export const usePayBill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      paymentData,
    }: {
      uuid: string;
      paymentData: PayBillRequest;
    }) => billsApi.pay(uuid, paymentData),
    onSuccess: (data, variables) => {
      // Invalidate bills queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: BILLS_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: BILLS_QUERY_KEYS.detail(variables.uuid),
      });
      toast.success(data.message || 'Bill paid successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to pay bill';
      toast.error(errorMessage);
    },
  });
};

// Hook specifically for approved bills (for treasury)
export const useGetApprovedBills = (
  additionalFilter?: Omit<BillsFilter, 'status'>
) => {
  const approvedFilter: BillsFilter = {
    status: 'APPROVED',
    ...additionalFilter,
  };

  const pendingPaymentFilter: BillsFilter = {
    status: 'PENDING_PAYMENT',
    ...additionalFilter,
  };

  const approvedQuery = useGetBills(approvedFilter);
  const pendingPaymentQuery = useGetBills(pendingPaymentFilter);

  // Combine data and remove duplicates based on uuid
  const combinedData =
    approvedQuery.data && pendingPaymentQuery.data
      ? {
          data: [
            ...approvedQuery.data.data,
            ...pendingPaymentQuery.data.data,
          ].filter(
            (bill, index, self) =>
              index === self.findIndex((b) => b.uuid === bill.uuid)
          ),
          meta: approvedQuery.data.meta,
        }
      : undefined;

  return {
    data: combinedData,
    isLoading: approvedQuery.isLoading || pendingPaymentQuery.isLoading,
    error: approvedQuery.error || pendingPaymentQuery.error,
    refetch: () => {
      approvedQuery.refetch();
      pendingPaymentQuery.refetch();
    },
  };
};
