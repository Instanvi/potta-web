import { useQuery } from "@tanstack/react-query";
import { salesApi } from "../utils/api";
import { ReceiptData } from "../utils/types";

export const useGetOneReceipt = (receiptId: string) => {
  return useQuery({
    queryKey: ['get-sales-receipt', receiptId],
    enabled: !!receiptId,
    queryFn: async () => {
      const response = await salesApi.getOne(receiptId);
      return response.data as unknown as ReceiptData;}
  });
};
