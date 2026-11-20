import { useState } from 'react';
import { benefitsApi } from '../utils/api';
import { BenefitPayload } from '../utils/types';

export const useCreateBenefit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createBenefit = async (benefitData: BenefitPayload) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await benefitsApi.createBenefit(benefitData);
      setSuccess(true);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create benefit';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBenefit,
    isLoading,
    error,
    success,
  };
};