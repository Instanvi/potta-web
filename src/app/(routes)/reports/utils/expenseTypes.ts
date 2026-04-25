// Common Types
export interface ReportPeriod {
  startDate: string;
  endDate: string;
}

// Base Expense Type
export interface Expense {
  expenseId: string;
  expenseCategory: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  vendorPayee: string;
  description: string;
  expenseStatus: 'paid' | 'pending' | 'refunded';
}

// Expense Summary Types
export interface ExpenseSummaryKPIs {
  totalExpenses: number;
  numberOfTransactions: number;
  highestExpenseCategory: string;
  averageExpenseAmount: number;
  mostUsedPaymentMethod: string;
}

// Vendor Report Types
export interface VendorExpenseKPIs {
  totalExpensesByVendor: { [vendor: string]: number };
  transactionsByVendor: { [vendor: string]: number };
  highestSpendingVendor: string;
  averageSpendPerVendor: number;
  mostCommonExpenseCategory: string;
}

// Category Report Types
export interface CategoryExpenseKPIs {
  totalExpensesByCategory: { [category: string]: number };
  transactionsByCategory: { [category: string]: number };
  highestSpendingCategory: string;
  averageSpendPerCategory: number;
  mostCommonPaymentMethodByCategory: { [category: string]: string };
}