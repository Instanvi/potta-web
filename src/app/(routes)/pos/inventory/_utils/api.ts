import axios from 'config/axios.config';
import { isAxiosError } from 'axios';
import { Filter, ProductResponse } from './types';
import { ProductPayload } from './validation';

export const productApi = {
  create: async (data: ProductPayload) => {
    const result = await axios.post(`/item`, data);
    return result?.data;
  },

  getAll: async (filter: Filter) => {
    const result = await axios.get(`/item`, {
      params: { ...filter },
    });
    console.log(result.data);
    return result.data;
  },
  getOne: async (product_id: string) => {
    const result = await axios.get(`/item/${product_id}`);
    return result.data;
  },
  update: async (product_id: string, data: unknown) => {
    const result = await axios.put(`/item/${product_id}`, data);
    return result?.data;
  },
  delete: async (product_id: string) => {
    const result = await axios.delete(`/item/${product_id}`);
    return result?.data;
  },
  restock: async (data: {
    productId: string;
    quantity: number;
    userId: string;
  }) => {
    const { productId: product_id, ...payload } = data;
    const result = await axios.put(`/item/${product_id}/restock`, payload);
    return result?.data;
  },
  uploadImage: async (file: File) => {
    try {
      // Create a simple FormData object with the file
      const formData = new FormData();
      formData.append('file', file);

      // Send the request without setting any headers
      const result = await axios.post('/files', formData);

      return result?.data;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  },
  importCsv: async (params: { file?: File; s3Key?: string }) => {
    const formData = new FormData();
    if (params.file) {
      formData.append('file', params.file);
    }
    if (params.s3Key) {
      formData.append('s3Key', params.s3Key);
    }

    const result = await axios.post('/item/import-csv', formData, {
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

export const documentsApi = {
  bulkDownload: async (ids: string[]) => {
    const result = await axios.post('/documents/bulk-download', { ids });
    return result.data;
  },
};
