import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPurchaseOrders, PurchaseOrderFilter } from '../utils/api';

export default function useGetAllPurchaseOrders(filter: PurchaseOrderFilter) {
  return useQuery({
    queryKey: ['purchase-orders', filter],
    queryFn: () => fetchPurchaseOrders(filter),
    placeholderData: keepPreviousData,
  });
}
