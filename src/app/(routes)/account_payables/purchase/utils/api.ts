import axios from 'config/axios.config';
import {
  PurchaseOrderFilter,
  CreatePurchaseOrderData,
  PurchaseOrderDetails,
} from './types';

export type {
  PurchaseOrderFilter,
  CreatePurchaseOrderData,
  PurchaseOrderDetails,
};

export async function fetchPurchaseOrders(filter: PurchaseOrderFilter) {
  const where: Record<string, unknown> = {};
  if (filter.status) where.status = filter.status;
  if (filter.vendorId) where.salePerson = { uuid: filter.vendorId };
  const response = await axios.post(
    '/purchase-order/filter',
    where,
    {
      params: {
        page: filter.page,
        limit: filter.limit,
        sortBy: filter.sortBy,
        search: filter.search,
        searchBy: filter.searchBy,
      },
    }
  );
  return response.data;
}

export async function createPurchaseOrder(data: CreatePurchaseOrderData) {
  const response = await axios.post('/purchase-order/create', data);
  return response.data;
}

export async function updatePurchaseOrder(
  purchaseOrderId: string,
  data: Partial<CreatePurchaseOrderData>
) {
  const response = await axios.put(`/purchase-order/${purchaseOrderId}`, data);
  return response.data;
}

export async function approvePurchaseOrder(purchaseOrderId: string) {
  const response = await axios.post(
    `/purchase-order/${purchaseOrderId}/approve`
  );
  return response.data;
}

export async function deletePurchaseOrder(purchaseOrderId: string) {
  const response = await axios.delete(`/purchase-order/${purchaseOrderId}`);
  return response.data;
}

export async function getPurchaseOrderDetails(
  purchaseOrderId: string
): Promise<PurchaseOrderDetails> {
  const response = await axios.get(
    `/purchase-order/details/${purchaseOrderId}`
  );
  return response.data;
}

/** Backend accepts one line item per call (LineItemsDto). */
export async function addPurchaseOrderLineItem(
  purchaseOrderId: string,
  lineItem: Record<string, unknown>
) {
  const response = await axios.post(
    `/purchase-order/${purchaseOrderId}/lineItems`,
    lineItem
  );
  return response.data;
}

export async function removePurchaseOrderLineItem(
  purchaseOrderId: string,
  lineItemId: string
) {
  const response = await axios.delete(
    `/purchase-order/${purchaseOrderId}/lineItem/${lineItemId}`
  );
  return response.data;
}

export async function fetchVendorPurchaseOrders(vendorId: string) {
  const response = await axios.get(`/purchase-order/vendor/${vendorId}`);
  return response.data;
}
