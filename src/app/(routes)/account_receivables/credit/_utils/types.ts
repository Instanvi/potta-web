export type CreditNoteStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED';

export type RefundMethod = 'CASH' | 'BANK_TRANSFER' | 'ACCOUNT_CREDIT';

export const REFUND_METHODS: { value: RefundMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'ACCOUNT_CREDIT', label: 'Account credit' },
];

interface CreditNoteParty {
  uuid: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
}

interface CreditNoteInvoice {
  uuid: string;
  invoiceId?: string;
  invoiceNumber?: string;
  code?: string;
  invoiceTotal?: number | string;
  currency?: string;
  status?: string;
  issuedDate?: string;
}

export interface CreditNote {
  uuid: string;
  creditNoteId: string;
  creditNoteType?: 'CUSTOMER' | 'VENDOR';
  issueDate: string;
  creditAmount: number | string;
  reason: string;
  notes?: string | null;
  status: CreditNoteStatus;
  customer?: CreditNoteParty | null;
  salePerson?: CreditNoteParty | null;
  invoice?: CreditNoteInvoice | null;
  approvedAt?: string | null;
  refundedAt?: string | null;
  refundAmount?: number | string | null;
  refundMethod?: RefundMethod | null;
  refundDescription?: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface CreditNoteFilter {
  page?: number;
  limit?: number;
  status?: CreditNoteStatus;
}

/**
 * Mirrors potta-backend CreditNoteDto. Field names (`invoceId`, `salesPersonId`)
 * follow the DTO exactly because the API rejects unknown properties.
 */
export interface CreateCreditNotePayload {
  customerId: string;
  issueDate: string;
  creditAmount: number;
  reason: string;
  invoceId?: string;
  salesPersonId: string;
  notes: string;
}

export interface RefundPayload {
  refundAmount: number;
  refundMethod: RefundMethod;
  bankDetails?: string;
  description?: string;
}

export const partyName = (party?: CreditNoteParty | null) =>
  party
    ? [party.firstName, party.lastName].filter(Boolean).join(' ') ||
      party.name ||
      party.email ||
      '—'
    : '—';
