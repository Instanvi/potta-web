import axios from 'config/axios.config';
import { CreateJournalPayload, Journal } from './types';

export const journalApi = {
  getAll: async (): Promise<Journal[]> => {
    const result = await axios.get('/accounting/journal-entries');
    return Array.isArray(result.data) ? result.data : result.data?.data ?? [];
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
  list: () => ['get-all-journals', 'entries'] as const,
};
