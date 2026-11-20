import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'config/axios.config';
import { useQueryClient } from '@tanstack/react-query';

// Define the PTO policy payload type based on the API documentation
interface PTOPolicyPayload {
  type: string;
  cycle_type: string;
  accrual_rate: number;
  total_entitled_days: number;
  start_date: string;
  end_date: string;
  status: string;
}

export const useCreatePTOPolicy = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createPTOPolicy = async (payload: PTOPolicyPayload) => {
    try {
      setIsSubmitting(true);

      console.log('Sending PTO policy data:', payload);

      // Call the API
      const response = await axios.post('/paid-time-off', payload);

      // Show success message
      toast.success('PTO policy added successfully!');

      // Invalidate TanStack Query for PTO policies
      queryClient.invalidateQueries(['ptoPolicies']);

      return { success: true, data: response.data };
    } catch (err: any) {
      // Show error message
      // toast.error(
      //   err.response?.data?.message || 'Failed to create PTO policy'
      // );
      console.error('Error creating PTO policy:', err);
      return { success: false, error: err };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createPTOPolicy, isSubmitting };
};
