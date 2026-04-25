import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PoliciesApi } from '../utils/api';
import { ExtendedApprovalRule } from '../types/approval-rule';
import { CustomerFilter, CustomerResponse } from '../../customers/utils/types';
import { customerApi } from '../../customers/utils/api';

// Query keys for better cache management
export const policyKeys = {
  all: ['policies'] as const,
  lists: () => [...policyKeys.all, 'list'] as const,
  list: (filters: any) => [...policyKeys.lists(), filters] as const,
  details: () => [...policyKeys.all, 'detail'] as const,
  detail: (id: string) => [...policyKeys.details(), id] as const,
  employees: () => ['employees'] as const,
  employee: (name: string) => [...policyKeys.employees(), name] as const,
  customers: () => ['customers'] as const,
  customer: (name: string) => [...policyKeys.customers(), name] as const,
  vendors: () => ['vendors'] as const,
  vendor: (name: string) => [...policyKeys.vendors(), name] as const,
  items: () => ['inventory-items'] as const,
  item: (name: string) => [...policyKeys.items(), name] as const,
};

// Hook for fetching all policies with filters
export const useGetPolicies = (filter: any = {}) => {
  return useQuery({
    queryKey: policyKeys.list(filter),
    queryFn: () => PoliciesApi.getAll(filter),
  });
};

// Hook for fetching a single policy by ID
export const useGetPolicy = (policyId: string) => {
  return useQuery({
    queryKey: policyKeys.detail(policyId),
    queryFn: () => PoliciesApi.getOne(policyId),
    enabled: !!policyId, // Only run the query if policyId exists
  });
};

// Hook for creating a new policy
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExtendedApprovalRule) => PoliciesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch policies list queries
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
    },
  });
};

// Hook for updating a policy
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: string; data: unknown }) =>
      PoliciesApi.update(policyId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific policy and list queries
      queryClient.invalidateQueries({ queryKey: policyKeys.detail(variables.policyId) });
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
    },
  });
};

// Hook for deleting a policy
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) => PoliciesApi.delete(policyId),
    onSuccess: () => {
      // Invalidate and refetch policies list queries
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
    },
  });
};

// Hook for searching employees
export const useSearchEmployees = (employeeName: string) => {
  return useQuery({
    queryKey: policyKeys.employee(employeeName),
    queryFn: () => PoliciesApi.SearchAllEmployees(employeeName),
  });
};

// Updated hook for searching customers
export const useSearchCustomers = (customerName: string) => {
  return useQuery({
    queryKey: policyKeys.customer(customerName),
    queryFn: () => PoliciesApi.SearchAllCustomers(customerName),
   
  });
};

// New hook for searching vendors
export const useSearchVendors = (vendorName: string) => {
  return useQuery({
    queryKey: policyKeys.vendor(vendorName),
    queryFn: () => PoliciesApi.SearchAllVendors(vendorName),
   
  });
};

// New hook for searching inventory items
export const useSearchItems = (itemName: string) => {
  return useQuery({
    queryKey: policyKeys.item(itemName),
    queryFn: () => PoliciesApi.SearchAllItems(itemName),
   
  });
};

