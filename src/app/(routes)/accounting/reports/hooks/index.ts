import { useQuery } from '@tanstack/react-query';
import {
  BalanceSheetReport,
  IncomeStatementReport,
  reportKeys,
  reportsApi,
} from '../utils/api';

export const useBalanceSheet = (asOfDate: string) =>
  useQuery({
    queryKey: reportKeys.balanceSheet(asOfDate),
    queryFn: () => reportsApi.balanceSheet(asOfDate) as Promise<BalanceSheetReport>,
    enabled: !!asOfDate,
  });

export const useIncomeStatement = (startDate: string, endDate: string) =>
  useQuery({
    queryKey: reportKeys.incomeStatement({ startDate, endDate }),
    queryFn: () =>
      reportsApi.incomeStatement({
        startDate,
        endDate: `${endDate}T23:59:59.999Z`,
      }) as Promise<IncomeStatementReport>,
    enabled: !!startDate && !!endDate && startDate <= endDate,
  });
