import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { benefitsApi } from '../utils/api';
import { FilterParams, BenefitPayload } from '../utils/types';
import { Benefit } from '../components/benefitTable';
import { useState } from 'react';

// Query Keys
export const BENEFITS_QUERY_KEYS = {
  all: ['benefits'] as const,
  lists: () => [...BENEFITS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: FilterParams) =>
    [...BENEFITS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...BENEFITS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BENEFITS_QUERY_KEYS.details(), id] as const,
};

// Fetch Benefits Query
export const useBenefitsQuery = (filters: FilterParams = {}) => {
  return useQuery({
    queryKey: BENEFITS_QUERY_KEYS.list(filters),
    queryFn: () => benefitsApi.filterBenefits(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Fetch Single Benefit Query
export const useBenefitQuery = (id: string) => {
  return useQuery({
    queryKey: BENEFITS_QUERY_KEYS.detail(id),
    queryFn: () => benefitsApi.getBenefit(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// Create Benefit Mutation
export const useCreateBenefitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BenefitPayload) => benefitsApi.createBenefit(data),
    onSuccess: (data) => {
      // Invalidate and refetch benefits list
      queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEYS.lists() });
      toast.success('Benefit created successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to create benefit';
      toast.error(errorMessage);
    },
  });
};

// Update Benefit Mutation
export const useUpdateBenefitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BenefitPayload> }) =>
      benefitsApi.updateBenefit(id, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch benefits list
      queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEYS.lists() });
      // Invalidate specific benefit detail
      queryClient.invalidateQueries({
        queryKey: BENEFITS_QUERY_KEYS.detail(variables.id),
      });
      toast.success('Benefit updated successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to update benefit';
      toast.error(errorMessage);
    },
  });
};

// Delete Benefit Mutation
export const useDeleteBenefitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => benefitsApi.deleteBenefit(id),
    onSuccess: (data, id) => {
      // Remove the deleted benefit from cache
      queryClient.removeQueries({ queryKey: BENEFITS_QUERY_KEYS.detail(id) });
      // Invalidate and refetch benefits list
      queryClient.invalidateQueries({ queryKey: BENEFITS_QUERY_KEYS.lists() });
      toast.success('Benefit deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete benefit';
      toast.error(errorMessage);
    },
  });
};

// Custom hook for benefits management with pagination
export const useBenefitsManagement = (initialFilters: FilterParams = {}) => {
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    ...initialFilters,
  });

  const {
    data: response,
    isLoading: isFetching,
    error,
    refetch,
  } = useBenefitsQuery(filters);

  const benefits = response?.data || [];
  const meta = response?.meta || { totalPages: 1, currentPage: 1 };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleSort = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortDirection, page: 1 }));
  };

  return {
    benefits,
    isFetching,
    error,
    currentPage: meta.currentPage,
    totalPages: meta.totalPages,
    pageSize: filters.pageSize || 10,
    filters,
    handlePageChange,
    handleSearch,
    handleSort,
    refetch,
  };
};

// Hook for getting a single benefit with loading state
export const useBenefitDetail = (id: string) => {
  const { data: benefit, isLoading, error } = useBenefitQuery(id);

  return {
    benefit,
    isLoading,
    error,
  };
};
