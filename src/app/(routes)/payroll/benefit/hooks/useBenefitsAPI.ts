import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { benefitsApi } from '../utils/api';
import { FilterParams, BenefitPayload } from '../utils/types';
import { Benefit } from '../components/benefitTable';

export const useBenefitsAPI = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchBenefits = useCallback(async () => {
    setIsFetching(true);
    try {
      const filterParams: FilterParams = {
        page: currentPage,
        pageSize: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      const response = await benefitsApi.filterBenefits(filterParams);

      if (response && response.data) {
        setBenefits(response.data);

        if (response.meta) {
          setTotalPages(response.meta.totalPages);
          setCurrentPage(response.meta.currentPage);
        }
      } else {
        console.error('Unexpected response format:', response);
        toast.error('Failed to parse benefits data');
      }
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toast.error('Failed to load benefits');
    } finally {
      setIsFetching(false);
    }
  }, [currentPage, pageSize]);

  const deleteBenefit = useCallback(
    async (id: string) => {
      try {
        await benefitsApi.deleteBenefit(id);
        toast.success('Benefit deleted successfully');
        fetchBenefits();
      } catch (error) {
        console.error('Error deleting benefit:', error);
        toast.error('Failed to delete benefit');
      }
    },
    [fetchBenefits]
  );

  const getBenefit = useCallback(async (id: string) => {
    try {
      const data = await benefitsApi.getBenefit(id);
      return data;
    } catch (error) {
      console.error('Error fetching benefit:', error);
      toast.error('Failed to load benefit data');
      return null;
    }
  }, []);

  const updateBenefit = useCallback(
    async (id: string, payload: Partial<BenefitPayload>) => {
      const loadingToastId = toast.loading('Updating benefit...');
      try {
        await benefitsApi.updateBenefit(id, payload);
        toast.success('Benefit updated successfully!');
        fetchBenefits();
        return true;
      } catch (error) {
        console.error('Error updating benefit:', error);
        toast.error('Failed to update benefit. Please try again.');
        return false;
      } finally {
        toast.dismiss(loadingToastId);
      }
    },
    [fetchBenefits]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    benefits,
    isFetching,
    currentPage,
    totalPages,
    pageSize,
    fetchBenefits,
    deleteBenefit,
    getBenefit,
    updateBenefit,
    handlePageChange,
  };
};
