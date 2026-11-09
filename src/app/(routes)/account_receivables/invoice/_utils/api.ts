import axios from 'config/axios.config';
import { IFilter, RecordInvoicePaymentPayload } from './types';
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
    search,
    issuedFrom,
    issuedTo,
  }: IFilter) => {
    const body = status ? { status } : {};
    const params: Record<string, string | number> = {
      page,
      limit,
      sortBy: `${sortBy}:${sortOrder}`,
    };
    if (search) params.search = search;
    if (issuedFrom && issuedTo) {
      params['filter.issuedDate'] = `$btw:${issuedFrom},${issuedTo}`;
    }
    const result = await axios.post('/invoice/filter', body, { params });
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
  reject: async (invoice_id: string, reason: string) => {
    const result = await axios.put(`/invoice/${invoice_id}/reject`, { reason });
    return result?.data;
  },
  pay: async (invoice_id: string, data: RecordInvoicePaymentPayload) => {
    const result = await axios.post(`/invoice/${invoice_id}/pay`, data);
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
