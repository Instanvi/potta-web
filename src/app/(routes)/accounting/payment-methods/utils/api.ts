import axios from 'config/axios.config';

export interface OrgPaymentMethod {
  uuid: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface OrgPaymentMethodPage {
  data: OrgPaymentMethod[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface OrgPaymentMethodPayload {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const paymentMethodKeys = {
  all: ['payment-methods'] as const,
  list: (params: { page: number; limit: number }) =>
    [...paymentMethodKeys.all, 'list', params] as const,
};

export const paymentMethodApi = {
  list: async (params: { page: number; limit: number }): Promise<OrgPaymentMethodPage> => {
    const res = await axios.get('/payment-method', { params });
    return res.data;
  },
  seedDefaults: async (): Promise<OrgPaymentMethod[]> => {
    const res = await axios.post('/payment-method/seed-defaults');
    return res.data;
  },
  create: async (data: OrgPaymentMethodPayload): Promise<OrgPaymentMethod> => {
    const res = await axios.post('/payment-method', data);
    return res.data;
  },
  update: async (
    id: string,
    data: Partial<OrgPaymentMethodPayload>,
  ): Promise<OrgPaymentMethod> => {
    const res = await axios.put(`/payment-method/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axios.delete(`/payment-method/${id}`);
    return res.data;
  },
};
