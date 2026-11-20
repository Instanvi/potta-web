import axios from 'config/axios.config';

export interface PurchaseOrderLineItem {
  // Define the structure for a line item (customize as needed)
  [key: string]: any;
}

export interface CreatePurchaseOrderPayload {
  orderNumber: string;
  orderDate: string;
  requiredDate: string;
  shipDate: string;
  orderTotal: number;
  shoppingAddress: string;
  paymentTerms: string;
  paymentMethod: string;
  status: string;
  customerId: string;
  vendorId: string;
  notes: string;
  lineItems: PurchaseOrderLineItem[];
}

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
  userId: string,
  branchId: string
) {
  const res = await axios.post('/purchase-order/create', payload);
  return res.data;
}
