import axios from 'config/axios.config';
import {
  CashAccount,
  CashbookEntry,
  CashbookEntryPayload,
  CashbookFilter,
  CashbookPage,
} from './types';

const CASH_OR_BANK_PREFIXES = ['57', '52', '53'];

const flatten = (nodes: CashAccount[]): CashAccount[] =>
  nodes.flatMap((n) => [n, ...flatten(n.children ?? [])]);

const clean = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  ) as Partial<T>;

export const cashbookApi = {
  list: async (filter: CashbookFilter = {}): Promise<CashbookPage> => {
    const res = await axios.get('/cashbook/entries', { params: clean(filter) });
    return res.data;
  },
  getOne: async (entryId: string): Promise<CashbookEntry> => {
    const res = await axios.get(`/cashbook/entries/${entryId}`);
    return res.data;
  },
  create: async (data: CashbookEntryPayload): Promise<CashbookEntry> => {
    const res = await axios.post('/cashbook/entries', clean(data));
    return res.data;
  },
  update: async (
    entryId: string,
    data: Partial<CashbookEntryPayload>
  ): Promise<CashbookEntry> => {
    const res = await axios.put(`/cashbook/entries/${entryId}`, clean(data));
    return res.data;
  },
  delete: async (entryId: string) => {
    const res = await axios.delete(`/cashbook/entries/${entryId}`);
    return res.data;
  },
  /** OHADA class-5 cash/bank accounts (57x, 52x, 53x) from the chart of accounts tree. */
  cashAccounts: async (): Promise<CashAccount[]> => {
    const res = await axios.get('/accounting/accounts/tree');
    const tree: CashAccount[] = Array.isArray(res.data) ? res.data : [];
    return flatten(tree)
      .filter(
        (a) =>
          a.code &&
          a.code.length >= 3 &&
          CASH_OR_BANK_PREFIXES.some((p) => a.code.startsWith(p))
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  },
};

export const cashbookKeys = {
  all: ['cashbook'] as const,
  list: (filter: CashbookFilter) => ['cashbook', 'entries', filter] as const,
  detail: (id: string) => ['cashbook', 'entry', id] as const,
  cashAccounts: () => ['cashbook', 'cash-accounts'] as const,
};
