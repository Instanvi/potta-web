import axios from 'config/axios.config';
import { PaidTimeOffFilterParams, PaidTimeOffPayload } from './types';

export const ptoApi = {
  // Get all PTO records with pagination and filtering
  filterPTOs: async (filters: PaidTimeOffFilterParams = {}) => {
    const result = await axios.post('/paid-time-off/filter', filters);
    return result.data;
  },

  // Get a specific PTO by ID
  getPTO: async (id: string) => {
    const result = await axios.get(`/paid-time-off/${id}`);
    return result.data;
  },

  // Create a new PTO
  createPTO: async (data: PaidTimeOffPayload) => {
    const result = await axios.post('/paid-time-off', data);
    return result.data;
  },

  // Accrue leave for a PTO record
  accrueLeave: async (id: string, amount: number) => {
    const result = await axios.put(`/paid-time-off/accrue/${id}`, {
      amount,
    });
    return result.data;
  },

  // Request leave for a PTO record
  requestLeave: async (
    id: string,
    days: number,
    startDate: string,
    endDate: string,
    reason: string
  ) => {
    const result = await axios.put(`/paid-time-off/request-leave/${id}`, {
      days,
      startDate,
      endDate,
      reason,
    });
    return result.data;
  },

  // Approve a PTO leave request
  approveLeave: async (requestId: string) => {
    const result = await axios.put(
      `/paid-time-off/approve-leave/${requestId}`,
      {}
    );
    return result.data;
  },

  // Reject a PTO leave request
  rejectLeave: async (requestId: string, reason: string) => {
    const result = await axios.put(
      `/paid-time-off/reject-leave/${requestId}`,
      { reason }
    );
    return result.data;
  },

  // Reset the PTO tracking for a new cycle
  resetCycle: async (id: string) => {
    const result = await axios.put(`/paid-time-off/reset-cycle/${id}`, {});
    return result.data;
  },
};
