// Types for Vendor RFQ Portal

export interface RFQLineItem {
  uuid: string;
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
  category?: string;
  unitPrice?: number | string; // Can be pre-filled or vendor will fill this
  totalAmount?: number | string; // Calculated: quantity * unitPrice
  rfqId?: string;
  orgId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RFQTerms {
  paymentTerms?: string;
  warrantyTerms?: string;
}

export interface RFQData {
  uuid: string;
  orgId: string;
  rfqNumber: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'SENT' | 'RESPONDED' | 'CLOSED' | 'AWARDED';
  deadline?: string;
  vendorList: string[];
  requirements?: any;
  items: RFQLineItem[];
  instructions?: string;
  terms?: RFQTerms;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  closedAt?: string;
  spendRequestId?: string;
  locationContextId?: string;
}

export interface ProformaInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  specifications?: string;
  category?: string;
}

export interface ProformaInvoiceRequest {
  vendorId: string;
  lineItems: ProformaInvoiceLineItem[];
}

export interface ProformaInvoiceResponse {
  id: string;
  rfqId: string;
  vendorId: string;
  invoiceNumber: string;
  lineItems: ProformaInvoiceLineItem[];
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface RFQTokenData {
  token: string;
  rfqId: string;
  vendorId: string;
}
