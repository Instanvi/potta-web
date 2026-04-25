import axios from 'config/axios.config';
import { Journal, JournalFilter, JournalResponse } from './types';

export const journalApi = {
  getAll: async (filter: JournalFilter = {}) => {
    const queryParams = new URLSearchParams();

    if (filter.page) queryParams.append('page', filter.page.toString());
    if (filter.limit) queryParams.append('limit', filter.limit.toString());
    if (filter.search) queryParams.append('search', filter.search);
    if (filter.type) queryParams.append('type', filter.type);
    if (filter.dateFrom) queryParams.append('startDate', filter.dateFrom);
    if (filter.dateTo) queryParams.append('endDate', filter.dateTo);

    const result = await axios.get(
      `/ledgers/general?${queryParams.toString()}`
    );
    return result.data as JournalResponse;
  },

  getOne: async (journalId: string) => {
    const result = await axios.get(`/accounting/journal-entries/${journalId}`);
    return result.data as Journal;
  },

  create: async (data: Omit<Journal, 'uuid' | 'createdAt' | 'updatedAt'>) => {
    const result = await axios.post('/accounting/journal-entries', data);
    return result.data as Journal;
  },

  update: async (
    journalId: string,
    data: Partial<Omit<Journal, 'uuid' | 'createdAt' | 'updatedAt'>>
  ) => {
    const result = await axios.put(
      `/accounting/journal-entries/${journalId}`,
      data
    );
    return result.data as Journal;
  },

  delete: async (journalId: string) => {
    const result = await axios.delete(
      `/accounting/journal-entries/${journalId}`
    );
    return result.data;
  },
};
