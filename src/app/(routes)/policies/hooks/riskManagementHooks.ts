import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  riskManagementApi,
  RiskPolicy,
  CreateRiskPolicyRequest,
  UpdateRiskPolicyRequest,
  RiskPolicyFilters,
} from '../utils/risk-management-api';

// Query keys for better cache management
export const riskPolicyKeys = {
  all: ['risk-policies'] as const,
  lists: () => [...riskPolicyKeys.all, 'list'] as const,
  list: (filters: RiskPolicyFilters) =>
    [...riskPolicyKeys.lists(), filters] as const,
  details: () => [...riskPolicyKeys.all, 'detail'] as const,
  detail: (id: string) => [...riskPolicyKeys.details(), id] as const,
};

// Hook for fetching all risk policies with filters
export const useGetRiskPolicies = (filters: RiskPolicyFilters = {}) => {
  return useQuery({
    queryKey: riskPolicyKeys.list(filters),
    queryFn: () => riskManagementApi.getPolicies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single risk policy by ID
export const useGetRiskPolicy = (policyId: string) => {
  return useQuery({
    queryKey: riskPolicyKeys.detail(policyId),
    queryFn: () => riskManagementApi.getPolicy(policyId),
    enabled: !!policyId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for creating a new risk policy
export const useCreateRiskPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRiskPolicyRequest) =>
      riskManagementApi.createPolicy(data),
    onSuccess: () => {
      // Invalidate and refetch risk policies list queries
      queryClient.invalidateQueries({ queryKey: riskPolicyKeys.lists() });
    },
  });
};

// Hook for updating a risk policy
export const useUpdateRiskPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      data,
    }: {
      policyId: string;
      data: UpdateRiskPolicyRequest;
    }) => riskManagementApi.updatePolicy(policyId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific policy and list queries
      queryClient.invalidateQueries({
        queryKey: riskPolicyKeys.detail(variables.policyId),
      });
      queryClient.invalidateQueries({ queryKey: riskPolicyKeys.lists() });
    },
  });
};

// Hook for deleting a risk policy
export const useDeleteRiskPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => riskManagementApi.deletePolicy(policyId),
    onSuccess: () => {
      // Invalidate and refetch risk policies list queries
      queryClient.invalidateQueries({ queryKey: riskPolicyKeys.lists() });
    },
  });
};

// Hook for enabling a risk policy
export const useEnableRiskPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => riskManagementApi.enablePolicy(policyId),
    onSuccess: (_, policyId) => {
      // Invalidate specific policy and list queries
      queryClient.invalidateQueries({
        queryKey: riskPolicyKeys.detail(policyId),
      });
      queryClient.invalidateQueries({ queryKey: riskPolicyKeys.lists() });
    },
  });
};

// Hook for disabling a risk policy
export const useDisableRiskPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => riskManagementApi.disablePolicy(policyId),
    onSuccess: (_, policyId) => {
      // Invalidate specific policy and list queries
      queryClient.invalidateQueries({
        queryKey: riskPolicyKeys.detail(policyId),
      });
      queryClient.invalidateQueries({ queryKey: riskPolicyKeys.lists() });
    },
  });
};
