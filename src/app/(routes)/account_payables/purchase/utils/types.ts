export interface PurchaseOrderFilter {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  searchBy?: string[];
}

export interface CreatePurchaseOrderData {
  orderDate: string;
  requiredDate: string;
  shipDate: string;
  orderTotal: number;
  shippingAddress: string;
  paymentTerms: string;
  paymentMethod: string;
  status: string;
  vendorId: string;
  notes: string;
  lineItems: any[];
}

export interface LineItem {
  uuid: string;
  branchId: string;
  orgId: string;
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
  taxAmount: number | null;
  discountRate: number;
  discountAmount: number | null;
}

export interface VendorAddress {
  uuid: string;
  branchId: string;
  orgId: string | null;
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
  latitude: number | null;
  longitude: number | null;
  geospatialLocation: string | null;
}

export interface Vendor {
  uuid: string;
  branchId: string;
  orgId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  userId: string | null;
  vendorId: string;
  type: string;
  name: string;
  paymentTerms: string;
  paymentMethod: string | null;
  accountDetails: string | null;
  openingBalance: number | null;
  currency: string;
  phone: string;
  email: string;
  contactPerson: string | null;
  website: string | null;
  taxId: string | null;
  classification: string;
  notes: string | null;
  status: string;
  subLedgerId: string;
  accountId: string;
  creditLimit: string;
  lastSynced: string | null;
  address: VendorAddress;
}

export interface PurchaseOrder {
  uuid: string;
  branchId: string;
  orgId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  updatedAt: string;
  purchaseOrderId: string;
  orderNumber: string;
  orderDate: string;
  requiredDate: string;
  shipDate: string;
  orderTotal: string;
  shippingAddress: string;
  paymentTerms: string;
  paymentMethod: string;
  notes: string;
  status: string;
  lineItems: LineItem[];
  salePerson: Vendor;
  customer: any | null;
}

export interface PurchaseOrderDetails extends PurchaseOrder {}
