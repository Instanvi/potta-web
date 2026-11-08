import { CustomerPayload } from './validations';
import axios from 'config/axios.config';
import { Customer } from './types';

export const customerApi = {
  create: async (data: CustomerPayload) => {
    const result = await axios.post(`/customer/create`, data);
    return result?.data;
  },
  getAll: async (filter: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams(filter).toString();
    const result = await axios.post(`/customer/filter?${queryParams}`);
    return result.data;
  },
  getOne: async (customer_id: string) => {
    const result = await axios.get<Customer>(`/customer/details/${customer_id}`);
    return result.data;
  },
  update: async (customer_id: string, data: unknown) => {
    const result = await axios.put(`/customer/${customer_id}`, data);
    return result?.data;
  },
  delete: async (customer_id: string) => {
    const result = await axios.delete(`/customer/${customer_id}`);
    return result?.data;
  },
};
