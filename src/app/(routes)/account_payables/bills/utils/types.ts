export type BillStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'OVERDUE'
  | 'ARCHIVED';

export type BillCurrency = 'XAF' | 'USD' | 'EUR';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'CREDIT_CARD'
  | 'DIGITAL_WALLET'
  | 'CREDIT'
  | 'OTHER';

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'MOBILE_MONEY', label: 'Mobile money' },
  { value: 'CREDIT_CARD', label: 'Credit card' },
  { value: 'DIGITAL_WALLET', label: 'Digital wallet' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'OTHER', label: 'Other' },
];

/** CREDIT cannot settle a bill. */
export const BILL_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) => m.value !== 'CREDIT');

export const billExpenseAccount = (bill: { paymentTerms?: string | null }) =>
  bill.paymentTerms?.startsWith('expense:') ? bill.paymentTerms.slice('expense:'.length) : '601';

export const paymentMethodLabel = (value?: string | null) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value ?? '—';

export interface BillVendor {
  uuid: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface BillLineItem {
  uuid: string;
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  taxRate?: number | string | null;
  taxAmount?: number | string | null;
  discountAmount?: number | string | null;
  totalAmount?: number | string | null;
  product?: { uuid: string; name?: string; sku?: string } | null;
}

export interface Bill {
  uuid: string;
  code: string;
  vendorInvoiceNumber?: string | null;
  status: BillStatus;
  issuedDate: string;
  dueDate: string;
  currency: string;
  invoiceTotal: number | string;
  taxAmount?: number | string | null;
  paymentMethod?: PaymentMethod | null;
  paymentReference?: string | null;
  notes?: string | null;
  /** The bill service stores the expense account as `expense:<code>`. */
  paymentTerms?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  vendor?: BillVendor | null;
  lineItems?: BillLineItem[];
}

export interface BillFilter {
  page?: number;
  limit?: number;
  status?: BillStatus;
  vendorId?: string;
  search?: string;
}

export interface BillPage {
  data: Bill[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface BillLinePayload {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
  productId?: string;
}

export interface CreateBillPayload {
  vendorId: string;
  purchaseOrderId?: string;
  vendorInvoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  currency?: BillCurrency;
  paymentMethod?: PaymentMethod;
  expenseAccountCode?: string;
  notes?: string;
  lineItems: BillLinePayload[];
}

export interface PayBillPayload {
  paymentMethod: PaymentMethod;
  amount?: number;
  paymentReference?: string;
}
