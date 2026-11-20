import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "../utils/api";

export const useDeleteSalesReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete-sales-receipt'],
    mutationFn: (receiptId: string) => salesApi.delete(receiptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-all-sales-receipts'] });
    },
  });
};
