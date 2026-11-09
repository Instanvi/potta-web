import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { salesApi } from "../utils/api";
import { Filters } from "../utils/types";

export const useGetAllSalesReceipts = (filter: Filters) => {
  return useQuery({
    queryKey: ['get-all-sales-receipts', filter],
    queryFn: () => salesApi.getAll(filter),
    placeholderData: keepPreviousData,
  });
};
