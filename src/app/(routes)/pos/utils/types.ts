// salesReceiptTypes.ts
export type Filter = {
  limit: number;
  page: number;
  sortBy?: 'updatedAt' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
};
// UUID Regex Pattern
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Enum Types
export const PaymentMethods = ['Credit Card', 'Bank Transfer', 'ACH Transfer', 'Other'] as const;
export type PaymentMethod = typeof PaymentMethods[number];

export const DiscountTypes = ['FlatRate', 'Percentage', 'PercentageWithCap'] as const;
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
  taxRate: number,
  category: string,
  images: null,
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
