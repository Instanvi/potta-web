import axios from 'config/axios.config';
import { TransactionFilter } from './types';

export interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
  transactionId?: string;
}

export interface Journal {
  uuid: string;
  type: string;
  date: string;
  description: string;
  organizationId: string;
  branchId: string;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  lines: JournalLine[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalResponse {
  data: Journal[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: [string, string][];
    search?: string;
    searchBy?: string[];
  };
  links: {
    current: string;
  };
}

export const transactionsApi = {
  getAll: async (filter: TransactionFilter = {}) => {
    const queryParams = new URLSearchParams();

    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());
    if (filter.search) queryParams.append('search', filter.search);
    if (filter.sortBy) queryParams.append('sortBy', filter.sortBy);
    if (filter.type) queryParams.append('type', filter.type);

    const result = await axios.get(`/payments?${queryParams.toString()}`);
    return result.data as JournalResponse;
  },

  getOne: async (uuid: string) => {
    const result = await axios.get(`/payments/${uuid}`);
    return result.data;
  },

  // create: async (data: Omit<Journal, 'uuid' | 'createdAt' | 'updatedAt'>) => {
  //   const result = await axios.post('/accounting/journal-entries', data);
  //   return result.data as Journal;
  // },

  // update: async (
  //   journalId: string,
  //   data: Partial<Omit<Journal, 'uuid' | 'createdAt' | 'updatedAt'>>
  // ) => {
  //   const result = await axios.put(
  //     `/accounting/journal-entries/${journalId}`,
  //     data
  //   );
  //   return result.data as Journal;
  // },

  // delete: async (journalId: string) => {
  //   const result = await axios.delete(
  //     `/accounting/journal-entries/${journalId}`
  //   );
  //   return result.data;
  // },
};
