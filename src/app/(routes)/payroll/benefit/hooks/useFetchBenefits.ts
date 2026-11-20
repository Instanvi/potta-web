'use client';
import { useState, useEffect } from 'react';
import { fetchBenefits } from '../utils/api';
import { Benefit } from '../utils/types';

interface FetchBenefitsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string[];
}

interface BenefitsResponse {
  data: Benefit[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: string[][];
  };
  links: {
    current: string;
  };
}

export const useFetchBenefits = (params: FetchBenefitsParams = {}) => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<BenefitsResponse['meta'] | null>(null);
  
  const { page = 1, limit = 10, search = '', sortBy = ['createdAt:DESC'] } = params;

  const loadBenefits = async () => {
    setLoading(true);
    try {
      const response = await fetchBenefits({ page, limit, search, sortBy });
      setBenefits(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch benefits');
      console.error('Error fetching benefits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, [page, limit, search, JSON.stringify(sortBy)]);

  return { benefits, loading, error, meta, refresh: loadBenefits };
};