export type DashboardSide = 'ar' | 'ap';

export interface DashboardPeriod {
  from: string;
  to: string;
}

export interface DashboardAging {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

export interface DashboardRecentRow {
  uuid: string;
  code: string;
  party: string | null;
  status: string;
  total: number;
  currency: string;
  issuedDate: string | null;
  dueDate: string | null;
}

/** Response of GET /accounting/dashboard/{ar|ap}. Aging and top balances are positive when owed. */
export interface PayablesReceivablesDashboard {
  side: DashboardSide;
  period: DashboardPeriod;
  totals: {
    open: number;
    openCount: number;
    overdue: number;
    overdueCount: number;
    paidInPeriod: number;
    paidCountInPeriod: number;
    draftCount: number;
  };
  aging: DashboardAging;
  top: { referenceId: string; name: string; balance: number }[];
  recent: DashboardRecentRow[];
}

export interface VendorOption {
  uuid: string;
  name: string;
  vendorId?: string;
  email?: string | null;
  currency?: string | null;
}

export interface PurchaseOrderOption {
  uuid: string;
  orderNumber?: string;
  purchaseOrderId?: string;
  orderDate?: string;
  orderTotal?: number | string;
  status?: string;
  salePerson?: { uuid: string; name?: string } | null;
}

export interface PurchaseOrderLine {
  description?: string;
  quantity?: number | string;
  unitPrice?: number | string;
  taxRate?: number | string | null;
  discountAmount?: number | string | null;
  product?: { uuid: string } | null;
}
