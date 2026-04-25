import axios from 'config/axios.config';
import { PTOPolicyPayload } from './types';

export const ptoApi = {
  // Create a new PTO policy
  createPTOPolicy: async (payload: PTOPolicyPayload) => {
    try {
      const response = await axios.post('/paid-time-off', payload);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating PTO policy:', error);
      return { success: false, error };
    }
  },

  // Get all PTO policies with pagination and filtering
  getPTOPolicies: async (filters: any = {}) => {
    try {
      const response = await axios.post(
        '/paid-time-off/filter',
        filters
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific PTO policy by ID
  getPTOPolicy: async (id: string) => {
    try {
      console.log(`Fetching PTO policy with ID: ${id}`);
      const response = await axios.get(`/paid-time-off/${id}`);
      console.log('PTO policy response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching PTO policy ${id}:`, error);
      return { success: false, error };
    }
  },

  // Accrue leave for a PTO policy
  accrueLeave: async (id: string, amount: number) => {
    try {
      const response = await axios.put(
        `/paid-time-off/accrue/${id}`,
        {
          amount,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error accruing leave for PTO ${id}:`, error);
      return { success: false, error };
    }
  },

  // Request leave for a PTO policy
  requestLeave: async (
    id: string,
    payload: {
      days: number;
      start_date: string;
      end_date: string;
      reason: string;
    }
  ) => {
    try {
      const response = await axios.put(
        `/paid-time-off/request-leave/${id}`,
        payload
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error requesting leave for PTO ${id}:`, error);
      const err = error as any;
      return { success: false, error, message: err.response?.data?.message };
    }
  },

  // Reset the PTO tracking for a new cycle
  resetPTOCycle: async (id: string) => {
    try {
      const response = await axios.put(
        `/paid-time-off/reset-cycle/${id}`,
        {}
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error resetting cycle for PTO ${id}:`, error);
      return { success: false, error };
    }
  },
};
