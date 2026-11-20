// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Vendor Summary Report Types
export interface Vendor {
  vendorId: string;
  vendorName: string;
  totalPurchases: number;
  amountPaid: number;
  outstandingBalance: number;
  lastPurchaseDate: string;
  vendorStatus: 'active' | 'inactive';
}

export interface VendorSummaryKPIs {
  totalPurchases: number;
  totalAmountPaid: number;
  totalOutstandingBalance: number;
  numberOfActiveVendors: number;
  largestVendorByPurchases: string;
}

// Vendor Aging Report Types
export interface VendorAging {
  vendorId: string;
  vendorName: string;
  totalOutstanding: number;
  days0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  lastPaymentDate: string;
  paymentStatus: 'current' | 'overdue';
}

export interface VendorAgingKPIs {
  totalOutstandingBalance: number;
  total0To30DaysBalance: number;
  total31To60DaysBalance: number;
  mostOverdueVendor: string;
  percentageOverdueVendors: number;
}