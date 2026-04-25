// import axios from 'config/axios.config';
import axios from 'config/axios.config';
import { Filter, ProductResponse } from './types';
import { SalesReceiptPayload } from './validation';

export const posApi = {
  create: async (data: SalesReceiptPayload) => {
    const result = await axios.post(`/sales-receipt/create`, data);
    return result;
  },
  getAll: async (filter: Filter) => {
    const result = await axios.get(`/item`, {
      params: { ...filter },
    });
    return result.data
  },
}
