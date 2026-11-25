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
  currency?: string | null;
  reason: string;
  notes?: string | null;
  lineItems?: CreditNoteLineItem[] | null;
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

/** One serialized form line, stored by the backend as jsonb on the credit note. */
export interface CreditNoteLineItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Tax percentage, e.g. 19.25. */
  taxRate: number;
  /** quantity x unitPrice + tax. */
  total: number;
}

/**
 * Mirrors potta-backend CreditNoteDto. Prefer `invoiceId` / `salePersonId`; the
 * API still accepts the legacy `invoceId` / `salesPersonId` aliases, but the
 * form must never send them (and never send empty ids).
 */
export interface CreateCreditNotePayload {
  customerId: string;
  issueDate: string;
  creditAmount: number;
  reason: string;
  invoiceId?: string;
  salePersonId?: string;
  notes?: string;
  currency?: string;
  lineItems?: CreditNoteLineItem[];
}

export interface RefundPayload {
  refundAmount: number;
  /** Org payment-method code, or ACCOUNT_CREDIT. */
  refundMethod: string;
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
