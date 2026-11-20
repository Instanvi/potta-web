import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  spendRequestsApi,
  rfqsApi,
  approvalsApi,
  procurementAnalyticsApi,
} from '../utils/api';
import type {
  SpendRequest,
  SpendRequestFilter,
  RFQ,
  RFQFilter,
  ApprovalAction,
  RejectionAction,
  SendRFQPayload,
  CloseRFQPayload,
} from '../utils/types';

// Query keys
export const PROCUREMENT_QUERY_KEYS = {
  spendRequests: (filter?: SpendRequestFilter) => [
    'procurement',
    'spend-requests',
    filter,
  ],
  spendRequest: (id: string) => ['procurement', 'spend-request', id],
  rfqs: (filter?: RFQFilter) => ['procurement', 'rfqs', filter],
  rfq: (id: string) => ['procurement', 'rfq', id],
  pendingApprovals: () => ['procurement', 'pending-approvals'],
  dashboard: () => ['procurement', 'dashboard'],
  analytics: (startDate?: string, endDate?: string) => [
    'procurement',
    'analytics',
    startDate,
    endDate,
  ],
  approvalHistory: (id: string) => ['procurement', 'approval-history', id],
};

// Spend Requests Hooks
export const useGetSpendRequests = (filter?: SpendRequestFilter) => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(filter),
    queryFn: () => spendRequestsApi.getAll(filter),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetSpendRequest = (id: string) => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.spendRequest(id),
    queryFn: () => spendRequestsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSpendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SpendRequest>) => spendRequestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(),
      });
      toast.success('Spend request created successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to create spend request';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateSpendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SpendRequest> }) =>
      spendRequestsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequest(variables.id),
      });
      toast.success('Spend request updated successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to update spend request';
      toast.error(errorMessage);
    },
  });
};

export const useSubmitSpendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => spendRequestsApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequest(id),
      });
      toast.success('Spend request submitted for approval');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to submit spend request';
      toast.error(errorMessage);
    },
  });
};

export const useApproveSpendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApprovalAction }) =>
      spendRequestsApi.approve(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequest(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.pendingApprovals(),
      });
      toast.success('Spend request approved successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to approve spend request';
      toast.error(errorMessage);
    },
  });
};

export const useRejectSpendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectionAction }) =>
      spendRequestsApi.reject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequest(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.pendingApprovals(),
      });
      toast.success('Spend request rejected');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to reject spend request';
      toast.error(errorMessage);
    },
  });
};

// RFQs Hooks
export const useGetRFQs = (filter?: RFQFilter) => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.rfqs(filter),
    queryFn: () => rfqsApi.getAll(filter),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetRFQ = (id: string) => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.rfq(id),
    queryFn: () => rfqsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRFQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spendRequestId,
      data,
    }: {
      spendRequestId: string;
      data: Partial<RFQ>;
    }) => rfqsApi.create(spendRequestId, data),
    onSuccess: (data, variables) => {
      // Invalidate both RFQs and spend requests to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.rfqs(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.spendRequest(variables.spendRequestId),
      });
      toast.success('RFQ created successfully');
    },
    onError: (error: any) => {
      // Log detailed error for debugging
      console.error('CreateRFQ Error Response:', {
        status: error?.response?.status,
        data: error?.response?.data,
        errors: error?.response?.data?.errors,
        message: error?.response?.data?.message,
      });
      
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to create RFQ';
      
      // Show validation errors if available
      const validationErrors = error?.response?.data?.errors;
      if (validationErrors && typeof validationErrors === 'object') {
        const errorList = Object.values(validationErrors).flat();
        toast.error(errorList.length > 0 ? errorList.join(', ') : errorMessage);
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

export const useSendRFQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendRFQPayload }) =>
      rfqsApi.send(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.rfqs(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.rfq(variables.id),
      });
      toast.success('RFQ sent to vendors successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to send RFQ';
      toast.error(errorMessage);
    },
  });
};

export const useCloseRFQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloseRFQPayload }) =>
      rfqsApi.close(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.rfqs(),
      });
      queryClient.invalidateQueries({
        queryKey: PROCUREMENT_QUERY_KEYS.rfq(variables.id),
      });
      toast.success('RFQ closed successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to close RFQ';
      toast.error(errorMessage);
    },
  });
};

// Approvals Hooks
export const useGetPendingApprovals = () => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.pendingApprovals(),
    queryFn: () => approvalsApi.getPending(),
    staleTime: 2 * 60 * 1000,
  });
};

// Dashboard & Analytics Hooks
export const useGetProcurementDashboard = () => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.dashboard(),
    queryFn: () => procurementAnalyticsApi.getDashboard(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetProcurementAnalytics = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.analytics(startDate, endDate),
    queryFn: () => procurementAnalyticsApi.getAnalytics(startDate, endDate),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetApprovalHistory = (id: string) => {
  return useQuery({
    queryKey: PROCUREMENT_QUERY_KEYS.approvalHistory(id),
    queryFn: () => spendRequestsApi.getApprovalHistory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
