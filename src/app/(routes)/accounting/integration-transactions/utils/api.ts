import axios from 'config/axios.config';
import {
  AcceptPayload,
  IntegrationTransaction,
  IntegrationTransactionFilter,
  IntegrationTransactionPage,
} from './types';

const clean = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  ) as Partial<T>;

export const integrationTransactionsApi = {
  list: async (filter: IntegrationTransactionFilter = {}): Promise<IntegrationTransactionPage> => {
    const res = await axios.get('/accounting/integration-transactions', {
      params: clean(filter),
    });
    return res.data;
  },
  getOne: async (id: string): Promise<IntegrationTransaction> => {
    const res = await axios.get(`/accounting/integration-transactions/${id}`);
    return res.data;
  },
  accept: async (id: string, body: AcceptPayload = {}): Promise<IntegrationTransaction> => {
    const res = await axios.post(`/accounting/integration-transactions/${id}/accept`, body);
    return res.data;
  },
  exclude: async (id: string): Promise<IntegrationTransaction> => {
    const res = await axios.post(`/accounting/integration-transactions/${id}/exclude`);
    return res.data;
  },
  review: async (
    id: string,
    body: { matchedDebitAccountCode?: string; matchedCreditAccountCode?: string } = {}
  ): Promise<IntegrationTransaction> => {
    const res = await axios.post(`/accounting/integration-transactions/${id}/review`, body);
    return res.data;
  },
};

export const integrationTransactionKeys = {
  all: ['integration-transactions'] as const,
  list: (filter: IntegrationTransactionFilter) =>
    ['integration-transactions', 'list', filter] as const,
  detail: (id: string) => ['integration-transactions', id] as const,
};
