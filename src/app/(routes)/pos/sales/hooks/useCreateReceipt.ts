import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SalesReceiptPayload } from "../utils/validation";
import { salesApi } from "../utils/api";

export const useCreateSalesReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-sales-receipt'],
    mutationFn: (data: SalesReceiptPayload) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-sales-receipts'] });
    },
  });
};
