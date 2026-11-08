import axios from 'config/axios.config';

export type SubLedgerKind = 'AR' | 'AP';

export interface AgingRow {
  referenceId: string;
  referenceName: string;
  currentBalance: number;
  aging: { current: number; days30: number; days60: number; days90: number; over90: number };
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

const isoDate = (d?: Date | string) =>
  d ? (typeof d === 'string' ? d : d.toISOString().slice(0, 10)) : undefined;

/** potta-backend books ledger endpoints (/ledgers/* and /accounting/ledger/*, /accounting/reports/*). */
export const ledgerApi = {
  general: async (params: DateRangeParams & { page?: number; limit?: number } = {}) => {
    const res = await axios.get('/ledgers/general', { params });
    return res.data;
  },
  balanceSheet: async (asOfDate?: Date | string) => {
    const res = await axios.get('/ledgers/balance-sheet', { params: { asOfDate: isoDate(asOfDate) } });
    return res.data;
  },
  incomeStatement: async (params: { startDate: string; endDate: string }) => {
    const res = await axios.get('/ledgers/income-statement', { params });
    return res.data;
  },
  agingReport: async (type: SubLedgerKind, asOfDate?: Date | string): Promise<AgingRow[]> => {
    const res = await axios.get(`/ledgers/sub-ledgers/${type}`, { params: { asOfDate: isoDate(asOfDate) } });
    return res.data ?? [];
  },
  subLedgerTransactions: async (subLedgerId: string, params: DateRangeParams = {}) => {
    const res = await axios.get(`/ledgers/sub-ledgers/${subLedgerId}/transactions`, { params });
    return res.data;
  },
  subLedgerBalance: async (subLedgerId: string) => {
    const res = await axios.get(`/ledgers/sub-ledgers/${subLedgerId}/balance`);
    return res.data;
  },
  accountTransactions: async (accountId: string, params: DateRangeParams = {}) => {
    const res = await axios.get(`/accounting/ledger/account/${accountId}/transactions`, { params });
    return res.data;
  },
  accountBalance: async (accountId: string, upToDate?: string) => {
    const res = await axios.get(`/accounting/ledger/account/${accountId}/balance`, { params: { upToDate } });
    return res.data;
  },
  accountPeriodBalance: async (accountId: string, params: { startDate: string; endDate: string }) => {
    const res = await axios.get(`/accounting/ledger/account/${accountId}/period-balance`, { params });
    return res.data;
  },
  reportBalanceSheet: async (asOfDate?: string) => {
    const res = await axios.get('/accounting/reports/balance-sheet', { params: { asOfDate } });
    return res.data;
  },
  reportIncomeStatement: async (params: { startDate: string; endDate: string }) => {
    const res = await axios.get('/accounting/reports/income-statement', { params });
    return res.data;
  },
};

export const ledgerKeys = {
  all: ['ledgers'] as const,
  general: (params?: object) => ['ledgers', 'general', params] as const,
  balanceSheet: (asOf?: string) => ['ledgers', 'balance-sheet', asOf] as const,
  incomeStatement: (params?: object) => ['ledgers', 'income-statement', params] as const,
  aging: (type: SubLedgerKind, asOf?: string) => ['ledgers', 'sub-ledgers', type, asOf] as const,
  accountTransactions: (accountId: string, params?: object) =>
    ['ledgers', 'account', accountId, 'transactions', params] as const,
};
