import { useQuery } from '@tanstack/react-query';
import { getPurchaseOrderDetails } from '../utils/api';
import { PurchaseOrderDetails } from '../utils/types';

interface UseGetPurchaseOrderDetailsProps {
  purchaseOrderId: string;
  enabled: boolean;
}

export default function useGetPurchaseOrderDetails({
  purchaseOrderId,
  enabled,
}: UseGetPurchaseOrderDetailsProps) {
  return useQuery({
    queryKey: ['purchase-order-details', purchaseOrderId],
    queryFn: async (): Promise<PurchaseOrderDetails> => {
      try {
        return await getPurchaseOrderDetails(purchaseOrderId);
      } catch (error: any) {
        if (error.response?.status === 404) {
          throw new Error('Purchase order not found');
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access');
        }
        throw new Error(
          error.message || 'Failed to fetch purchase order details'
        );
      }
    },
    enabled: enabled && !!purchaseOrderId,
    retry: false,
  });
}
