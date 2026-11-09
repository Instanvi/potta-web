import axios from 'config/axios.config';
import { CreateJournalPayload, Journal, JournalFilter, JournalResponse } from './types';

export const journalApi = {
  getAll: async ({ page = 1, limit = 20, search }: JournalFilter = {}): Promise<JournalResponse> => {
    const params: Record<string, string | number> = { page, limit, sortBy: 'date:DESC' };
    if (search?.trim()) params.search = search.trim();
    const result = await axios.get('/accounting/journal-entries', { params });
    if (Array.isArray(result.data)) {
      return {
        data: result.data,
        meta: {
          itemsPerPage: result.data.length,
          totalItems: result.data.length,
          currentPage: 1,
          totalPages: 1,
          sortBy: [['date', 'DESC']],
        },
        links: { current: '' },
      };
    }
    return result.data as JournalResponse;
  },

  getOne: async (journalId: string) => {
    const result = await axios.get(`/accounting/journal-entries/${journalId}`);
    return result.data as Journal;
  },

  create: async (data: CreateJournalPayload) => {
    const result = await axios.post('/accounting/journal-entries', data);
    return result.data as Journal;
  },

  delete: async (journalId: string) => {
    const result = await axios.delete(`/accounting/${journalId}`);
    return result.data;
  },
};

export const journalKeys = {
  all: ['get-all-journals'] as const,
  list: (filter: JournalFilter = {}) => ['get-all-journals', 'entries', filter] as const,
};
