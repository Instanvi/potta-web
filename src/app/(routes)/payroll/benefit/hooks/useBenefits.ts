'use client';
import { useQuery } from '@tanstack/react-query';
import { benefitsApi } from '../utils/api';
import { Benefit } from '../utils/types';
import React from 'react';

export type BenefitFilter = {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

export const useBenefits = (initialFilter: BenefitFilter = {}) => {
  const [filter, setFilter] = React.useState<BenefitFilter>({
    page: 1,
    limit: 20,
    sort_by: 'createdAt',
    sort_order: 'asc',
    ...initialFilter,
  });

  const updateFilter = (newFilter: Partial<BenefitFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['benefits', filter],
    queryFn: async () => {
      const response = await benefitsApi.filterBenefits(filter);
      return response;
    },
  });

  return {
    benefits: data?.data || [],
    meta: data?.meta,
    loading: isLoading,
    error,
    updateFilter,
  };
};