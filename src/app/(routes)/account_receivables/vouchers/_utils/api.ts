import axios from 'config/axios.config';
import { Filter } from './types';

export const vouchersApi = {
  create: async (data:any) => {
    const result = await axios.post(`/vouchers`, data);
    return result?.data;
  },
  getAll: async (filter: Filter) => {
    const data = {}
    const result = await axios.get('/vouchers/all', {
      params: { ...filter },
    });
    console.log('result',result)
    return result?.data;
  },
  getOne: async (voucher_id: string) => {
    const result = await axios.get(`/vouchers/${voucher_id}`);
    return result?.data;
  },

  delete: async (voucher_id: string) => {
    const result = await axios.delete(`/vouchers/${voucher_id}`);
    return result?.data;
  },

};
