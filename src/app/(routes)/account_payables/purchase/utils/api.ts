import axios from '../../../../../../config/axios.config';
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
  const response = await axios.post(
    '/purchase-order/filter',
    {},
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

export async function createPurchaseOrder(
  data: CreatePurchaseOrderData,
  userId: string,
  branchId: string
) {
  const response = await axios.post('/purchase-order', {
    ...data,
    userId,
    branchId,
  });
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
