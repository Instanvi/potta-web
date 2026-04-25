import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePurchaseOrder } from '../utils/api';

interface DeletePurchaseOrderArgs {
  purchaseOrderId: string;
}

export default function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ purchaseOrderId }: DeletePurchaseOrderArgs) => {
      return await deletePurchaseOrder(purchaseOrderId);
    },
    onSuccess: () => {
      // Invalidate and refetch purchase orders
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
