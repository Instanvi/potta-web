// salesReceiptTypes.ts
export type Filter = {
  limit: number;
  page: number;
  sortBy?: 'updatedAt' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  productType?: 'INVENTORY' | 'NON_INVENTORY' | 'ASSEMBLY' | 'SIMPLEGROUPS';
};
// UUID Regex Pattern
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

import type { DiscountType, PaymentMethod, SaleLineItem, SalePayload } from './sale';

export type { DiscountType, PaymentMethod } from './sale';
export { DISCOUNT_TYPES as DiscountTypes, PAYMENT_METHOD_VALUES as PaymentMethods } from './sale';

export type LineItem = SaleLineItem;

export type SalesReceipt = SalePayload;

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
export type Product = {
  uuid: string,
  createdAt: string,
  createdBy: string,
  updatedBy: string | null,
  deletedAt: string | null,
  updatedAt: string | null,
  productId: string,
  name: string,
  description: string,
  unitOfMeasure: string,
  cost: number,
  sku: string,
  inventoryLevel: number,
  salesPrice: number,
  taxable: boolean,
  tax?: { uuid: string; name: string; rate: number | string; type?: string } | null,
  type?: 'INVENTORY' | 'NON_INVENTORY' | null,
  structure?: 'SIMPLE' | 'ASSEMBLY' | 'SIMPLEGROUPS' | null,
  category: string | { uuid: string; name: string } | null,
  images: string[] | null,
  status: string,
}


export type ProductResponse = {
  data: Product[],
  meta: {
    itemsPerPage: number,
    totalItems: number,
    currentPage: number,
    totalPages: number
  }
}
