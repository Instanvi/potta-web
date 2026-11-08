/** Row of GET /ledgers/general (GeneralLedgerEntry). */
export interface GeneralLedgerEntry {
  uuid: string;
  transactionId: string;
  entryLineId: string;
  transactionDate: string;
  journalEntryNumber: string;
  accountNumber: string;
  accountName: string;
  debitAmount: number | string;
  creditAmount: number | string;
  description: string;
  referenceNumber: string;
  sourceModule: string;
}

export interface GeneralLedgerPage {
  data: GeneralLedgerEntry[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

/** Row of GET /ledgers/sub-ledgers/:id/transactions (SubLedgerEntry). */
export interface SubLedgerEntry {
  uuid: string;
  journalEntryId: string;
  transactionDate: string;
  debitAmount: number | string;
  creditAmount: number | string;
  runningBalance: number | string;
  description: string;
  referenceNumber: string;
}
