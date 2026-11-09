import axios from 'config/axios.config';
import { Filter, ProductResponse } from './types';
import { SalesReceiptPayload } from './validation';

/** nestjs-paginate expects `sortBy=column:DIRECTION`. */
const toPaginateParams = ({ sortBy, sortOrder, search, productType, ...rest }: Filter) => ({
  ...rest,
  ...(search?.trim() ? { search: search.trim() } : {}),
  ...(sortBy ? { sortBy: `${sortBy}:${sortOrder ?? 'DESC'}` } : {}),
  // Assemblies and groups are product structures; inventory / non-inventory are product types.
  ...(productType === 'ASSEMBLY' || productType === 'SIMPLEGROUPS'
    ? { 'filter.structure': `$eq:${productType}` }
    : productType
      ? { 'filter.type': `$eq:${productType}` }
      : {}),
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
