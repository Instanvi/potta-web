import axios from 'config/axios.config';
import { IFilter } from './types';
import { IInvoicePayload } from './valididation';

export const invoiceApi = {
  create: async (data: IInvoicePayload) => {
    const result = await axios.post(`/invoice/create`, data);
    return result?.data;
  },
  getAll: async ({
    page,
    limit,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    status,
  }: IFilter) => {
    const body = status ? { status } : {};
    const result = await axios.post('/invoice/filter', body, {
      params: { page, limit, sortBy: `${sortBy}:${sortOrder}` },
    });
    return result?.data;
  },
  getOne: async (invoice_id: string) => {
    const result = await axios.get(`/invoice/details/${invoice_id}`);
    return result?.data;
  },

  update: async (invoice_id: string, data: unknown) => {
    const result = await axios.put(`/invoice/${invoice_id}`, data);
    return result?.data;
  },
  delete: async (invoice_id: string) => {
    const result = await axios.delete(`/invoice/${invoice_id}`);
    return result?.data;
  },
  addLineItems: async (invoiceId: string, lineItems: unknown[]) => {
    const result = await axios.post(`/invoice/${invoiceId}/lineItems`, lineItems);
    return result?.data;
  },
  removeLineItem: async (invoiceId: string, lineItemId: string) => {
    const result = await axios.delete(
      `/invoice/${invoiceId}/lineItem/${lineItemId}`
    );
    return result?.data;
  },
  getByCustomer: async (
    customerId: string,
    params: { page?: number; limit?: number } = {}
  ) => {
    const result = await axios.get(`/invoice/customer/${customerId}`, {
      params,
    });
    return result?.data;
  },
};
