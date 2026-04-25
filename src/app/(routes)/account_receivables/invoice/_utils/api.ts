import axios from 'config/axios.config';
import { IFilter } from './types';
import { IInvoicePayload } from './valididation';

export const invoiceApi = {
  create: async (data: IInvoicePayload) => {
    const result = await axios.post(`/invoice/create`, data);
    return result?.data;
  },
  getAll: async (filter: IFilter) => {
    const data = {};
    const result = await axios.post('/invoice/filter', data, {
      params: { ...filter },
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
  approve: async (invoice_id: string) => {
    const result = await axios.put(`/invoice/${invoice_id}/approve`);
    return result?.data;
  },
  addLineItem: async (invoiceId: string, user_id: string, data: unknown) => {
    const result = await axios.post(`/invoice/${invoiceId}/lineItem`, data, {
      params: { user_id },
    });
    return result?.data;
  },
  testApi: async () => {
    const result = await axios.get('/invoice/test');
    return result?.data;
  },
  removeLineItem: async (invoiceId: string, lineItemId: string) => {
    const result = await axios.delete(
      `/invoice/${invoiceId}/lineItem/${lineItemId}`
    );
    return result?.data;
  },
  getAllCustomers: async (invoice_id: string): Promise<unknown> => {
    const result = await axios.get('/invoice/customer/' + invoice_id);
    return result?.data;
  },
};
