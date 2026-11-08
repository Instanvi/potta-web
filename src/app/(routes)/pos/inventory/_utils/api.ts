import axios from 'config/axios.config';
import { Filter, ProductResponse } from './types';
import { ProductPayload } from './validation';

export const productApi = {
  create: async (data: ProductPayload) => {
    const result = await axios.post(`/Item`, data);
    return result?.data;
  },

  getAll: async ({ sortBy, sortOrder, search, ...filter }: Filter): Promise<ProductResponse> => {
    const result = await axios.get(`/Item`, {
      params: {
        ...filter,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(sortBy ? { sortBy: `${sortBy}:${sortOrder ?? 'DESC'}` } : {}),
      },
    });
    return result.data;
  },
  getOne: async (product_id: string) => {
    const result = await axios.get(`/Item/${product_id}`);
    return result.data;
  },
  update: async (product_id: string, data: unknown) => {
    const result = await axios.put(`/Item/${product_id}`, data);
    return result?.data;
  },
  delete: async (product_id: string) => {
    const result = await axios.delete(`/Item/${product_id}`);
    return result?.data;
  },
  restock: async (data: {
    productId: string;
    quantity: number;
    cost?: number;
  }) => {
    const { productId: product_id, ...payload } = data;
    const result = await axios.put(`/Item/${product_id}/restock`, payload);
    return result?.data;
  },
  updateImages: async (product_id: string, images: string[]) => {
    const result = await axios.put(`/Item/${product_id}`, { images });
    return result?.data;
  },
  importCsv: async (params: { file?: File; s3Key?: string }) => {
    const formData = new FormData();
    if (params.file) {
      formData.append('file', params.file);
    }
    if (params.s3Key) {
      formData.append('s3Key', params.s3Key);
    }

    const result = await axios.post('/Item/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return result?.data;
  },
};

export const productCategoryApi = {
  create: async (data: { name: string; description: string }) => {
    const result = await axios.post(`/product-category`, data);
    return result?.data;
  },
  getAll: async (params = {}) => {
    const result = await axios.get(`/product-category`, { params });
    return result?.data;
  },
  getOne: async (uuid: string) => {
    const result = await axios.get(`/product-category/${uuid}`);
    return result?.data;
  },
  update: async (uuid: string, data: { name: string; description: string }) => {
    const result = await axios.put(`/product-category/${uuid}`, data);
    return result?.data;
  },
  delete: async (uuid: string) => {
    const result = await axios.delete(`/product-category/${uuid}`);
    return result?.data;
  },
};
