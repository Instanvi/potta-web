export interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
  transactionId?: string;
}

export interface Journal {
  uuid: string;
  number?: string;
  referenceNumber?: string;
  type: string;
  date: string;
  description: string;
  organizationId?: string;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  lines: JournalLine[];
  createdAt: string;
  updatedAt: string;
}

/** Body of POST /accounting/journal-entries (potta-backend CreateJournalEntryDTO). */
export interface CreateJournalPayload {
  type: string;
  date: string;
  description: string;
  sourceDocumentType?: string;
  lines: { accountId: string; debit?: number; credit?: number; description?: string }[];
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

export interface JournalFilter {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}
