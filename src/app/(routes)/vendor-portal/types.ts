export interface LineItem {
  uuid: string;
  description: string;
  quantity: number;
  discountType: string;
  unitPrice: number;
  discountCap: number;
  discountRate: number;
  taxRate: number;
}

export interface Vendor {
  uuid: string;
  name: string;
  contactPerson: string | null;
  email: string;
  phone: string;
  address: {
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
    latitude: string | null;
    longitude: string | null;
    geospatialLocation: string | null;
  };
}

export interface PurchaseOrder {
  uuid: string;
  orderNumber: string;
  orderDate: string;
  requiredDate: string;
  shipDate: string;
  orderTotal: string;
  paymentTerms: string;
  paymentMethod: string;
  status: string;
  notes: string;
  shippingAddress?: string;
}

export interface PurchaseOrderDetails {
  success: boolean;
  message: string;
  purchaseOrder: PurchaseOrder;
  lineItems: LineItem[];
  vendor: Vendor;
}

export interface VendorInvoiceData {
  purchaseOrderId: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentTerms: string;
  billingAddress: string;
  shippingAddress: string;
  notes: string;
  lineItems: {
    description: string;
    quantity: number;
    discountCap: number;
    discountType: string;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
    productId: string;
  }[];
}
