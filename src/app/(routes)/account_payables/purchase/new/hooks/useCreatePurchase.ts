import axios from 'config/axios.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  userId: string;
  branchId: string;
}

export default function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, userId, branchId }: CreatePurchaseOrderArgs) => {
      const response = await axios.post('/purchase-order/create', data, {});
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch purchase orders
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}
