// Report-related types and interfaces

export type ReportCategoryId =
  | 'frequent'
  | 'all'
  | 'financial'
  | 'collection'
  | 'customer'
  | 'disbursement'
  | 'expense'
  | 'inventory'
  | 'tax'
  | 'vendor'
  | 'revenue_analytics'
  | 'expense_analytics'
  | 'financial_analytics'
  | 'human_capital'
  | 'sales_inventory'
  | 'budget_analytics'
  | 'billings'
  | 'bookings'
  | 'cashflow'
  | 'headcount'
  | 'revenue'
  | 'sales'
  | 'api_debug';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategoryId;
  dataType?: 'payment' | 'budget';
}

export interface ReportSubmenu {
  id: string;
  label: string;
  chartKey: string;
  factName?: string;
  metrics?: string[];
  dimensions?: string[];
  module?: 'finance' | 'human_capital' | 'sales_inventory';
}

export interface ReportCategory {
  id: ReportCategoryId;
  label: string;
  icon: React.ReactNode;
  folderName?: string;
  submenus?: ReportSubmenu[];
}

export interface ReportDataType {
  collection: Report[];
  customer: Report[];
  disbursement: Report[];
  expense: Report[];
  financial: Report[];
  inventory: Report[];
  tax: Report[];
  vendor: Report[];
  [key: string]: Report[];
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

export interface Payment {
  paymentId: string;
  payee: string;
  paymentDate: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentStatus: string;
  invoiceId: string;
  disbursementType: string;
}

export interface PaymentKPIs {
  totalPaymentsMade: number;
  numberOfPayments: number;
  mostCommonPaymentMethod: string;
  largestPayment: number;
  outstandingPayments: number;
}

export interface Budget {
  budgetId: string;
  budgetName: string;
  allocatedBudget: number;
  amountSpent: number;
  remainingBudget: number;
  utilizationPercentage: number;
  startDate: string;
  endDate: string;
  department: string;
}

export interface BudgetUtilizationKPIs {
  totalBudgetAllocated: number;
  totalAmountSpent: number;
  overallUtilizationRate: number;
  departmentWithHighestUtilization: string;
  departmentWithLowestUtilization: string;
}

export interface ReportData {
  reportPeriod: ReportPeriod;
  payments: Payment[];
  paymentKpis: PaymentKPIs;
  budgets: Budget[];
  budgetKpis: BudgetUtilizationKPIs;
}
