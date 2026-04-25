import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvePurchaseOrder } from '../utils/api';

interface ApprovePurchaseOrderArgs {
  purchaseOrderId: string;
}

export default function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ purchaseOrderId }: ApprovePurchaseOrderArgs) => {
      return await approvePurchaseOrder(purchaseOrderId);
    },
    onSuccess: () => {
      // Invalidate and refetch purchase orders
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
