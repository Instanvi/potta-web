import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reimbursementsApi, employeesApi } from '../utils/api-client';
import {
  Reimbursement,
  CreateReimbursementRequest,
  ApproveReimbursementRequest,
  PayReimbursementRequest,
  Employee,
} from '../utils/api-types';
import toast from 'react-hot-toast';

// Query keys
export const REIMBURSEMENT_QUERY_KEYS = {
  all: ['reimbursements'] as const,
  lists: () => [...REIMBURSEMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...REIMBURSEMENT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...REIMBURSEMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REIMBURSEMENT_QUERY_KEYS.details(), id] as const,
};

export const EMPLOYEE_QUERY_KEYS = {
  all: ['employees'] as const,
  lists: () => [...EMPLOYEE_QUERY_KEYS.all, 'list'] as const,
  details: () => [...EMPLOYEE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EMPLOYEE_QUERY_KEYS.details(), id] as const,
};

// Reimbursement hooks
export const useGetReimbursements = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  employeeId?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: REIMBURSEMENT_QUERY_KEYS.list(params || {}),
    queryFn: () => reimbursementsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetReimbursement = (uuid: string) => {
  return useQuery({
    queryKey: REIMBURSEMENT_QUERY_KEYS.detail(uuid),
    queryFn: () => reimbursementsApi.getById(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateReimbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReimbursementRequest) =>
      reimbursementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.lists(),
      });
      toast.success('Reimbursement request submitted successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to submit reimbursement request';
      toast.error(errorMessage);
    },
  });
};

export const useApproveReimbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveReimbursementRequest) =>
      reimbursementsApi.approve(data),
    onSuccess: (data) => {
      // Dismiss loading toast
      toast.dismiss(`approve-${data.uuid}`);

      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.detail(data.uuid),
      });
      toast.success('Reimbursement approved successfully');
    },
    onError: (error: any, variables) => {
      // Dismiss loading toast
      toast.dismiss(`approve-${variables.reimbursementId}`);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to approve reimbursement';
      toast.error(errorMessage);
    },
  });
};

export const usePayReimbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PayReimbursementRequest) => reimbursementsApi.pay(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.detail(data.uuid),
      });
      toast.success('Reimbursement marked as paid successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to mark reimbursement as paid';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateReimbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uuid,
      data,
    }: {
      uuid: string;
      data: Partial<CreateReimbursementRequest>;
    }) => reimbursementsApi.update(uuid, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.detail(data.uuid),
      });
      toast.success('Reimbursement updated successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to update reimbursement';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteReimbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => reimbursementsApi.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: REIMBURSEMENT_QUERY_KEYS.lists(),
      });
      toast.success('Reimbursement deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to delete reimbursement';
      toast.error(errorMessage);
    },
  });
};

// Employee hooks
export const useGetEmployees = (params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortBy?: string[];
}) => {
  return useQuery<{ data: Employee[] }>({
    queryKey: [...EMPLOYEE_QUERY_KEYS.lists(), params],
    queryFn: () => employeesApi.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetEmployee = (uuid: string) => {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.detail(uuid),
    queryFn: () => employeesApi.getById(uuid),
    enabled: !!uuid,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
