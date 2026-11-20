// salesReceiptTypes.ts
export type Filters = {
  limit: number;
  page: number;
  sortBy?: 'updatedAt' | 'createdAt' | 'saleDate' | 'totalAmount';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  /** nestjs-paginate range on saleDate, e.g. "$btw:2026-11-01T00:00:00.000Z,2026-11-09T23:59:59.999Z". */
  'filter.saleDate'?: string;
};
// UUID Regex Pattern
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import type { PaymentMethod } from '../../utils/sale';
import type { SalesReceipt } from '../../utils/types';

export type { DiscountType, PaymentMethod } from '../../utils/sale';
export type { LineItem, SalesReceipt } from '../../utils/types';
export { DiscountTypes, PaymentMethods } from '../../utils/types';


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
