// import axios from 'config/axios.config';
import axios from 'config/axios.config';
import { Filters, SalesReceiptListResponse } from './types';
import { SalesReceiptPayload } from './validation';

export const salesApi = {
  create: async (data: SalesReceiptPayload) => {
    const result = await axios.post(`/sales-receipt/create`, data);
    return result?.data;
  },
  getAll: async (filter:Record<string, any> = {}) => {
    const queryParams = new URLSearchParams(filter).toString();
    const result= await axios.post(`/sales-receipt/filter?${queryParams}`);
    return result.data
  },
  getOne: async ( receipt_id: string) => {
    const result = await axios.get(`/sales-receipt/details/${receipt_id}`);
    console.log(result)
    return result;
  },

  delete: async (receipt_id: string) => {
    const result = await axios.delete(`/sales-receipt/${receipt_id}`);
    return result?.data;
  },

}
