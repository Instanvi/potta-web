// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Customer Summary Report Types
export interface Customer {
  customerId: string;
  customerName: string;
  customerEmail: string;
  registrationDate: string;
  totalPurchases: number;
  numberOfTransactions: number;
  lastPurchaseDate: string;
  customerStatus: 'active' | 'inactive';
}

export interface CustomerSummaryKPIs {
  totalCustomers: number;
  totalPurchases: number;
  averageCustomerValue: number;
  numberOfActiveCustomers: number;
  mostValuableCustomer: string;
}

// Customer Aging Report Types
export interface CustomerAging {
  customerId: string;
  customerName: string;
  totalOutstanding: number;
  days0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  lastPaymentDate: string;
  paymentStatus: 'current' | 'overdue';
}

export interface CustomerAgingKPIs {
  totalOutstandingBalance: number;
  percentageOverdueCustomers: number;
  total0To30DaysBalance: number;
  total31To60DaysBalance: number;
  mostOverdueCustomer: string;
}