import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import axios from "config/axios.config";
import { pottaAnalyticsService } from "@potta/services/analyticsService";
import { approveBill, fetchBills, rejectBill } from "@potta/app/(routes)/account_payables/bills/utils/api";

const getDateQueryParams = (range?: DateRange) => {
  const params: Record<string, string> = {};
  if (range?.from) {
    params.start_date = range.from.toISOString();
  }
  if (range?.to) {
    params.end_date = range.to.toISOString();
  }
  return params;
};

export const billsQueryKey = (body?: unknown) => [
  "bills",
  body ? JSON.stringify(body) : "",
];

export function useBills(params: { body?: Record<string, unknown> }) {
  return useQuery({
    queryKey: billsQueryKey(params.body),
    queryFn: () => fetchBills(params.body),
  });
}

export function useApproveBill(body?: Record<string, unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: billsQueryKey(body),
      });
    },
  });
}

export function useRejectBill(body?: Record<string, unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: billsQueryKey(body),
      });
    },
  });
}

export function useApBalance(range?: DateRange) {
  return useQuery({
    queryKey: ["ap-balance", range?.from?.toISOString(), range?.to?.toISOString()],
    queryFn: async () => {
      return pottaAnalyticsService.finance.getAnalytics("ap_balance", {
        metrics: ["vendor_running_balance"],
        dimensions: ["time"],
        time_granularity: "monthly",
        use_mock_data: true,
        ...getDateQueryParams(range),
      });
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useApExpenses(range?: DateRange) {
  return useQuery({
    queryKey: [
      "expense-vendors",
      range?.from?.toISOString(),
      range?.to?.toISOString(),
    ],
    queryFn: async () => {
      return pottaAnalyticsService.finance.getAnalytics("expenses", {
        metrics: ["total_expenses"],
        dimensions: ["time", "vendor"],
        time_granularity: "monthly",
        use_mock_data: true,
        ...getDateQueryParams(range),
      });
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useApBills(range?: DateRange) {
  return useQuery({
    queryKey: [
      "bills-ap-dashboard",
      range?.from?.toISOString(),
      range?.to?.toISOString(),
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (range?.from) {
        params.startDate = range.from.toISOString();
      }
      if (range?.to) {
        params.endDate = range.to.toISOString();
      }
      const response = await axios.get("/bills", { params });
      return response.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useApVendors() {
  return useQuery({
    queryKey: ["vendors-ap-dashboard"],
    queryFn: async () => {
      const response = await axios.get("/vendors");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
