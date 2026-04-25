import { useQuery } from '@tanstack/react-query';
import { fetchPurchaseOrders, PurchaseOrderFilter } from '../utils/api';

export default function useGetAllPurchaseOrders(filter: PurchaseOrderFilter) {
  return useQuery({
    queryKey: ['purchase-orders', filter],
    queryFn: () => fetchPurchaseOrders(filter),
    // staleTime: 1000 * 60, // Uncomment if you want to keep previous data for 1 minute
  });
}
