import axios from 'config/axios.config';
import { DecductionProps, Filter } from './types';

export const deductionsApi = {
  create: async (data: DecductionProps) => {
    const result = await axios.post('/deductions', data);
    return result?.data;
  },
  getAll: async (filter: Filter) => {
    const result = await axios.get('/deductions', {
      params: { ...filter },
    });
    return result.data;
  },
  getByid: async (id: string | number) => {
    const result = await axios.get(`/deductions/${id}`);
    return result.data;
  },
  delete: async (id: string) => {
    const result = await axios.delete(`/deductions/${id}`);
    return result.data;
  },
  updateBracket: async (id: string, data: unknown) => {
    const result = await axios.put(`/deductions/${id}/brackets`, data);
    return result?.data;
  },
  deactivate: async (id: string) => {
    const result = await axios.put(`/deductions/${id}/deactivate`);
    return result.data;
  },
  calculate: async (id: string, salary: number) => {
    const result = await axios.post(`/deductions/${id}/calculate`, { salary });
    return result.data;
  },
  isApplicable: async (id: string, itemType: string) => {
    const result = await axios.post(
      `/deductions/${id}/is-applicable`,
      itemType
    );
    return result.data;
  },
};
