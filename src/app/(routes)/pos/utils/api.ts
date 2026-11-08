import axios from 'config/axios.config';
import { Filter, ProductResponse } from './types';
import { SalesReceiptPayload } from './validation';

/** nestjs-paginate expects `sortBy=column:DIRECTION`. */
const toPaginateParams = ({ sortBy, sortOrder, search, ...rest }: Filter) => ({
  ...rest,
  ...(search?.trim() ? { search: search.trim() } : {}),
  ...(sortBy ? { sortBy: `${sortBy}:${sortOrder ?? 'DESC'}` } : {}),
});

export const posApi = {
  create: async (data: SalesReceiptPayload) => {
    const result = await axios.post(`/sales-receipt/create`, data);
    return result.data;
  },
  getAll: async (filter: Filter): Promise<ProductResponse> => {
    const result = await axios.get(`/Item`, { params: toPaginateParams(filter) });
    return result.data;
  },
};
