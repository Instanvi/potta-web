import { useQuery } from '@tanstack/react-query';
import { apLookupKeys, apLookupsApi, dashboardApi, dashboardKeys } from '../utils/api';
import { DashboardPeriod, DashboardSide } from '../utils/types';

export const useDashboardSummary = (side: DashboardSide, period: Partial<DashboardPeriod>) =>
  useQuery({
    queryKey: dashboardKeys[side](period),
    queryFn: () => dashboardApi.summary(side, period),
  });

export const useVendorOptions = () =>
  useQuery({
    queryKey: apLookupKeys.vendors(),
    queryFn: () => apLookupsApi.vendors(),
    staleTime: 5 * 60 * 1000,
  });

export const usePurchaseOrderOptions = (vendorId?: string) =>
  useQuery({
    queryKey: apLookupKeys.purchaseOrders(vendorId),
    queryFn: () => apLookupsApi.purchaseOrders(vendorId),
    enabled: !!vendorId,
    staleTime: 60 * 1000,
  });
