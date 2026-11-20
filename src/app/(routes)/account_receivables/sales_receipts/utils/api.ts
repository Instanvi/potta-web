// import axios from 'config/axios.config';
import axios from 'config/axios.config';
import { Filters, SalesReceiptListResponse } from './types';
import { SalesReceiptPayload } from './validation';

export const salesApi = {
  create: async (data: SalesReceiptPayload) => {
    const result = await axios.post(`/sales-receipt/create`, data);
    return result?.data;
  },
  getAll: async ({
    page,
    limit,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    paymentMethod,
    search,
    saleFrom,
    saleTo,
  }: Filters) => {
    const body = paymentMethod ? { paymentMethod } : {};
    const params: Record<string, string | number> = {
      page,
      limit,
      sortBy: `${sortBy}:${sortOrder}`,
    };
    if (search) params.search = search;
    if (saleFrom && saleTo) {
      params['filter.saleDate'] = `$btw:${saleFrom},${saleTo}`;
    }
    const result = await axios.post('/sales-receipt/filter', body, { params });
    return result.data;
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
