export type IntegrationSource = 'pay' | 'expense' | 'pos' | 'other';
export type IntegrationDirection = 'in' | 'out';
export type IntegrationStatus = 'new' | 'reviewed' | 'posted' | 'excluded';

export interface IntegrationTransaction {
  id: string;
  orgId: string;
  locationId?: string | null;
  externalId: string;
  source: IntegrationSource;
  amount: number | string;
  direction: IntegrationDirection;
  status: IntegrationStatus;
  currency: string;
  description?: string | null;
  payload?: Record<string, unknown> | null;
  matchedDebitAccountCode?: string | null;
  matchedCreditAccountCode?: string | null;
  journalEntryId?: string | null;
  journalEntryNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationTransactionFilter {
  page?: number;
  limit?: number;
  sortBy?: string;
  search?: string;
  status?: IntegrationStatus | '';
  source?: IntegrationSource | '';
}

export interface IntegrationTransactionPage {
  data: IntegrationTransaction[];
  meta?: {
    totalItems?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
  };
}

export interface AcceptPayload {
  matchedDebitAccountCode?: string;
  matchedCreditAccountCode?: string;
  lines?: Array<{
    accountCode: string;
    debit?: number;
    credit?: number;
    description?: string;
  }>;
}
