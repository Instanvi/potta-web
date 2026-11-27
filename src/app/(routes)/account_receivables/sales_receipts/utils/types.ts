// salesReceiptTypes.ts
export type Filters = {
  limit: number;
  page: number;
  sortBy?: 'updatedAt' | 'createdAt' | 'saleDate' | 'totalAmount';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  /** Exact PaymentMethod (e.g. 'CASH'); sent in the filter body. */
  paymentMethod?: string;
  /** Inclusive ISO bounds for `filter.saleDate=$btw:from,to`. */
  saleFrom?: string;
  saleTo?: string;
};
// UUID Regex Pattern
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** @deprecated Prefer GET /payment-method — kept for filters/labels fallback. */
export const SALES_RECEIPT_PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ACH_TRANSAFER', label: 'ACH Transfer' },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'OTHER', label: 'Other' },
] as const;

/** Org payment method code stored on the receipt (dynamic catalog). */
export type PaymentMethod = string;

/** @deprecated use SALES_RECEIPT_PAYMENT_METHODS */
export const PaymentMethods = SALES_RECEIPT_PAYMENT_METHODS.map((m) => m.label);

export const paymentMethodLabel = (value?: string | null) =>
  SALES_RECEIPT_PAYMENT_METHODS.find((m) => m.value === value)?.label ??
  value ??
  '—';

/** @deprecated validation now accepts any org method code string */
export const SALES_RECEIPT_PAYMENT_METHOD_VALUES =
  SALES_RECEIPT_PAYMENT_METHODS.map((m) => m.value);

export const DiscountTypes = ['FLAT_RATE', 'PERCENTAGE', 'PERCENTAGE_WITH_CAP'] as const;
export type DiscountType = typeof DiscountTypes[number];

// Line Item Type
export type LineItem = {
  description: string;
  quantity: number;
  discountCap: number;
  discountType: DiscountType;
  unitPrice: number;
  taxRate: number;
  discountRate?: number;
  productId: string;
};

// Sales Receipt Type
export type SalesReceipt = {
  saleDate: string;
  totalAmount: number;
  paymentReference?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  discountAmount: number;
  customerId: string;
  salePerson: string;
  lineItems: LineItem[];
};


// Optional: Type for unregistered customer sales
export type UnregisteredSalesReceipt = Omit<SalesReceipt, 'customerId'> & {
  customerId?: string;
};

// Response Types
export type SalesReceiptResponse = {
  success: boolean;
  data: SalesReceipt;
  message?: string;
};

export type SalesReceiptListResponse = {
  success: boolean;
  data: SalesReceipt[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  message?: string;
};

// Filter Type for Sales Receipt Queries
export type SalesReceiptFilter = {
  limit: number;
  page: number;
  sortBy?: 'saleDate' | 'totalAmount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  customerId?: string;
  salePerson?: string;
};


interface LineItemres {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  description: string;
  quantity: number;
  discountType: string;
  unitPrice: number;
  discountCap: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number | null;
}

interface Address {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  geospatialLocation: any | null;
}

interface Customer {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  customerId: string;
  type: string;
  contactPerson: string;
  creditLimit: number;
  taxId: string;
  status: string;
  address: Address;
}

interface SalesPerson {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  orgId: string;
  vendorId: string;
  type: string;
  name: string;
  paymentTerms: string;
  paymentMethod: string;
  accountDetails: string;
  openingBalance: string;
  currency: string;
  phone: string;
  email: string;
  contactPerson: string;
  website: string;
  taxId: string;
  classification: string;
  notes: string;
  status: string;
  address: Address;
}

export interface ReceiptData {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  saleReceiptId: string;
  saleDate: string;
  totalAmount: number;
  taxAmount: number;
  receiptNumber: string;
  notes: string;
  paymentReference: string;
  discountAmount: number;
  paymentMethod: string;
  lineItems: LineItemres[];
  customer: Customer;
  salePerson: SalesPerson;
}
