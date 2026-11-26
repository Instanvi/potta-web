import axios from 'config/axios.config';
import { sanitizeDocumentPayload } from '@/lib/document-api-fields';
import { Bill, BillFilter, BillPage, CreateBillPayload, PayBillPayload } from './types';

const clean = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  ) as Partial<T>;

export const billsApi = {
  list: async (filter: BillFilter = {}): Promise<BillPage> => {
    const res = await axios.get('/bills', { params: clean(filter) });
    return res.data;
  },
  get: async (billId: string): Promise<Bill> => {
    const res = await axios.get(`/bills/${billId}`);
    return res.data;
  },
  create: async (data: CreateBillPayload): Promise<Bill> => {
    const res = await axios.post(
      '/bills',
      sanitizeDocumentPayload(clean(data) as Record<string, unknown>),
    );
    return res.data;
  },
  approve: async (billId: string, expenseAccountCode?: string): Promise<Bill> => {
    const res = await axios.put(`/bills/${billId}/approve`, clean({ expenseAccountCode }));
    return res.data;
  },
  reject: async (billId: string, reason?: string): Promise<Bill> => {
    const res = await axios.put(`/bills/${billId}/reject`, clean({ reason }));
    return res.data;
  },
  pay: async (billId: string, data: PayBillPayload): Promise<Bill> => {
    const res = await axios.put(`/bills/${billId}/pay`, clean(data));
    return res.data;
  },
  send: async (
    billId: string,
    data: { channel?: 'email' | 'sms'; to?: string; phone?: string; message?: string } = {},
  ): Promise<{ ok: true; to: string; channel: 'email' | 'sms' }> => {
    const res = await axios.post(`/bills/${billId}/send`, data);
    return res.data;
  },
};

export const billKeys = {
  all: ['bills'] as const,
  list: (filter: BillFilter) => ['bills', 'list', filter] as const,
  detail: (id: string) => ['bills', 'detail', id] as const,
};
