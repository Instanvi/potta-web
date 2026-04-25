// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Balance Sheet Types
export interface BalanceSheet {
  assets: {
    currentAssets: number;
    fixedAssets: number;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: number;
    longTermLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    shareholdersEquity: number;
    totalEquity: number;
  };
}

export interface BalanceSheetKPIs {
  totalAssets: number;
  totalLiabilities: number;
  equityToAssetRatio: number;
  debtToEquityRatio: number;
  netWorth: number;
}

// Income Statement Types
export interface IncomeStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  interestExpense: number;
  preTaxProfit: number;
  taxes: number;
  netProfit: number;
  depreciation: number;
  amortization: number;
}

export interface IncomeStatementKPIs {
  totalRevenue: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  ebitda: number;
}

// Cash Flow Types
export interface CashFlow {
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netIncreaseInCash: number;
  openingBalance: number;
  closingBalance: number;
}

export interface CashFlowKPIs {
  totalOperatingCash: number;
  totalInvestingCash: number;
  totalFinancingCash: number;
  netCashFlow: number;
  cashBalance: number;
}

// AR Aging Types
export interface ARAgingEntry {
  customerId: string;
  customerName: string;
  totalOutstanding: number;
  days0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  lastPaymentDate: string;
  invoiceNumber: string;
  paymentStatus: 'current' | 'overdue';
}

export interface ARAgingKPIs {
  totalOutstandingReceivables: number;
  total0To30Days: number;
  total31To60Days: number;
  mostOverdueCustomer: string;
  percentageOverdue: number;
}

// AP Aging Types
export interface APAgingEntry {
  vendorId: string;
  vendorName: string;
  totalOutstanding: number;
  days0To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  lastPaymentDate: string;
  invoiceNumber: string;
  paymentStatus: 'current' | 'overdue';
}

export interface APAgingKPIs {
  totalOutstandingPayables: number;
  total0To30Days: number;
  total31To60Days: number;
  mostOverdueVendor: string;
  percentageOverdue: number;
}

// Budget vs Actual Types
export interface BudgetEntry {
  category: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  period: string;
}

export interface BudgetKPIs {
  totalBudgetedAmount: number;
  totalActualAmount: number;
  totalVariance: number;
  averageVariancePercentage: number;
  overBudgetCategories: number;
}