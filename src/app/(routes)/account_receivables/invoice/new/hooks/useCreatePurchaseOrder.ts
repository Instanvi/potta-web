import { useMutation } from '@tanstack/react-query';
import {
  createPurchaseOrder,
  CreatePurchaseOrderPayload,
} from '../api/purchaseOrder';

interface UseCreatePurchaseOrderOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useCreatePurchaseOrder(
  userId: string,
  branchId: string,
  options?: UseCreatePurchaseOrderOptions
) {
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) =>
      createPurchaseOrder(payload, userId, branchId),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
