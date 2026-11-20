export const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

/** Body of POST /accounting/accounts (potta-backend CreateAccountRequestDTO). */
export interface accountPayload {
  name: string;
  type: AccountType;
  initialBalance: number;
  code?: string;
  parentId?: string;
}
