// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Payment Summary Types
export interface Payment {
  paymentId: string;
  payee: string;
  paymentDate: string;
  paymentMethod: string;
  paymentAmount: number;
  paymentStatus: string;
  invoiceId?: string;
  paymentReference?: string;
  disbursementType: string;
}

export interface PaymentSummaryKPIs {
  totalPaymentsMade: number;
  numberOfPayments: number;
  mostCommonPaymentMethod: string;
  largestPayment: number;
  outstandingPayments: number;
}

// Budget Utilization Types
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
