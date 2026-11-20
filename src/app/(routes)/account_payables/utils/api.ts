import axios from 'config/axios.config';
import {
  DashboardPeriod,
  DashboardSide,
  PayablesReceivablesDashboard,
  PurchaseOrderLine,
  PurchaseOrderOption,
  VendorOption,
} from './types';

const LOOKUP_LIMIT = 100;

export const dashboardApi = {
  summary: async (
    side: DashboardSide,
    period: Partial<DashboardPeriod> = {}
  ): Promise<PayablesReceivablesDashboard> => {
    const res = await axios.get(`/accounting/dashboard/${side}`, {
      params: { from: period.from || undefined, to: period.to || undefined },
    });
    return res.data;
  },
};

export const apLookupsApi = {
  vendors: async (): Promise<VendorOption[]> => {
    const res = await axios.post('/vendor/filter', {}, {
      params: { page: 1, limit: LOOKUP_LIMIT, sortBy: 'createdAt:DESC' },
    });
    return res.data?.data ?? [];
  },
  /** The filter endpoint has no vendor param, so orders are narrowed to the vendor client-side. */
  purchaseOrders: async (vendorId?: string): Promise<PurchaseOrderOption[]> => {
    const res = await axios.post('/purchase-order/filter', {}, {
      params: { page: 1, limit: LOOKUP_LIMIT, sortBy: 'createdAt:DESC' },
    });
    const rows: PurchaseOrderOption[] = res.data?.data ?? [];
    return vendorId ? rows.filter((po) => po.salePerson?.uuid === vendorId) : rows;
  },
  purchaseOrderLines: async (purchaseOrderId: string): Promise<PurchaseOrderLine[]> => {
    const res = await axios.get(`/purchase-order/details/${purchaseOrderId}`);
    return res.data?.lineItems ?? [];
  },
};

export const dashboardKeys = {
  ap: (period: Partial<DashboardPeriod>) => ['ap-dashboard', period] as const,
  ar: (period: Partial<DashboardPeriod>) => ['ar-dashboard', period] as const,
};

export const apLookupKeys = {
  vendors: () => ['ap-lookups', 'vendors'] as const,
  purchaseOrders: (vendorId?: string) => ['ap-lookups', 'purchase-orders', vendorId ?? 'all'] as const,
};
