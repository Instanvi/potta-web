export type CashbookEntryType = 'RECEIPT' | 'PAYMENT' | 'TRANSFER';
export type CashbookDirection = 'IN' | 'OUT';
export type CashbookCurrency = 'XAF' | 'USD' | 'EUR';

export const INCOME_CATEGORIES = [
  { value: 'SALES', label: 'Sales' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'INVOICED_WORKS', label: 'Invoiced works' },
  { value: 'ACCESSORY_PRODUCTS', label: 'Accessory products' },
  { value: 'FINANCIAL_INCOME', label: 'Financial income' },
  { value: 'OTHER_INCOME', label: 'Other income' },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: 'PURCHASES', label: 'Purchases' },
  { value: 'RAW_MATERIALS', label: 'Raw materials' },
  { value: 'OFFICE_SUPPLIES', label: 'Office supplies' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'RENT', label: 'Rent' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'PERSONNEL', label: 'Personnel' },
  { value: 'TAXES', label: 'Taxes' },
  { value: 'OTHER_EXPENSES', label: 'Other expenses' },
] as const;

export type CashbookCategory =
  | (typeof INCOME_CATEGORIES)[number]['value']
  | (typeof EXPENSE_CATEGORIES)[number]['value'];

export const categoriesFor = (direction: CashbookDirection) =>
  direction === 'IN' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

export interface CashAccount {
  uuid: string;
  code: string;
  name: string;
  type?: string;
  children?: CashAccount[];
}

export interface CashbookEntry {
  uuid: string;
  cashAccountId: string;
  cashAccount?: CashAccount | null;
  entryType: CashbookEntryType;
  direction: CashbookDirection;
  amount: number | string;
  currency: CashbookCurrency;
  transactionDate: string;
  reference?: string | null;
  counterparty?: string | null;
  narration?: string | null;
  invoiceId?: string | null;
  category?: CashbookCategory | null;
  reconciled?: boolean;
  journalEntryId?: string | null;
  createdAt: string;
}

export interface CashbookPage {
  data: CashbookEntry[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

/** Query params accepted by CashbookEntryFilterDto (extra keys are rejected by the API). */
export interface CashbookFilter {
  cashAccountId?: string;
  direction?: CashbookDirection;
  startDate?: string;
  endDate?: string;
  reference?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

/** Mirrors potta-backend CreateCashbookEntryDto. */
export interface CashbookEntryPayload {
  cashAccountId?: string;
  entryType: CashbookEntryType;
  direction: CashbookDirection;
  amount: number;
  currency: CashbookCurrency;
  transactionDate: string;
  reference?: string;
  counterparty?: string;
  narration?: string;
  category: CashbookCategory;
}
