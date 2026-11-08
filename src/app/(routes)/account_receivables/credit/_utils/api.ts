import axios from 'config/axios.config';
import {
  CreateCreditNotePayload,
  CreditNote,
  CreditNoteFilter,
  Paginated,
  RefundPayload,
} from './types';

export const creditNoteApi = {
  getAll: async ({
    page = 1,
    limit = 10,
    ...where
  }: CreditNoteFilter = {}): Promise<Paginated<CreditNote>> => {
    const result = await axios.post('/credit-note/filter', where, {
      params: { page, limit, sortBy: 'createdAt:DESC' },
    });
    return result.data;
  },
  getOne: async (creditNoteId: string): Promise<CreditNote> => {
    const result = await axios.get(`/credit-note/details/${creditNoteId}`);
    return result.data;
  },
  create: async (data: CreateCreditNotePayload): Promise<CreditNote> => {
    const result = await axios.post('/credit-note/create', data);
    return result.data;
  },
  delete: async (creditNoteId: string) => {
    const result = await axios.delete(`/credit-note/${creditNoteId}`);
    return result.data;
  },
  approve: async (creditNoteId: string): Promise<CreditNote> => {
    const result = await axios.put(`/credit-note/${creditNoteId}/approve`);
    return result.data;
  },
  refund: async (creditNoteId: string, data: RefundPayload): Promise<CreditNote> => {
    const result = await axios.put(`/credit-note/${creditNoteId}/refund`, data);
    return result.data;
  },
  /** The backend reads the invoice id from an `invoiceId` header, so it is sent in both places. */
  applyToInvoice: async (creditNoteId: string, invoiceId: string): Promise<CreditNote> => {
    const result = await axios.post(
      `/credit-note/${creditNoteId}/invoice/${invoiceId}`,
      {},
      { headers: { invoiceId } }
    );
    return result.data;
  },
  getCustomerInvoices: async (customerId: string, limit = 100) => {
    const result = await axios.get(`/invoice/customer/${customerId}`, {
      params: { page: 1, limit },
    });
    return result.data;
  },
};

export const creditNoteKeys = {
  all: ['credit-notes'] as const,
  list: (filter: CreditNoteFilter) => ['credit-notes', 'list', filter] as const,
  detail: (id: string) => ['credit-notes', 'detail', id] as const,
  customerInvoices: (customerId: string) =>
    ['credit-notes', 'customer-invoices', customerId] as const,
};
