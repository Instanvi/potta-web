import axios from 'config/axios.config';

export type TaxType = 'PERCENTAGE' | 'FIXED';

export interface Tax {
  uuid: string;
  name: string;
  taxId?: string | null;
  description?: string | null;
  rate?: number | string | null;
  type: TaxType;
  flatRate?: number | string | null;
  isActive: boolean;
  createdAt: string;
}

export interface TaxPage {
  data: Tax[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

/** Mirrors potta-backend TaxDto. */
export interface TaxPayload {
  name: string;
  taxId?: string;
  description?: string;
  rate?: number;
  type: TaxType;
  flatRate?: number;
  isActive?: boolean;
}

export const taxApi = {
  list: async (params: { page: number; limit: number }): Promise<TaxPage> => {
    const res = await axios.get('/tax', { params });
    return res.data;
  },
  create: async (data: TaxPayload): Promise<Tax> => {
    const res = await axios.post('/tax', data);
    return res.data;
  },
  update: async (id: string, data: Partial<TaxPayload>): Promise<Tax> => {
    const res = await axios.put(`/tax/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axios.delete(`/tax/${id}`);
    return res.data;
  },
  importCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post('/tax/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const taxKeys = {
  all: ['taxes'] as const,
  list: (params: { page: number; limit: number }) => ['taxes', 'list', params] as const,
};
