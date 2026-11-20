import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPurchaseOrder } from '../../utils/api';

interface PurchaseOrderData {
  orderDate: string;
  requiredDate: string;
  shipDate: string;
  orderTotal: number;
  shippingAddress: string;
  paymentTerms: string;
  paymentMethod: string;
  status: string;
  vendorId: string;
  notes: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    discountCap: number;
    discountType: string;
    unitPrice: number;
    taxRate: number;
    discountRate: number;
    productId: string;
  }>;
}

interface CreatePurchaseOrderArgs {
  data: PurchaseOrderData;
  userId?: string;
  branchId?: string;
}

export default function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: CreatePurchaseOrderArgs) => createPurchaseOrder(data),
    onSuccess: () => {
      // Invalidate and refetch purchase orders
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
