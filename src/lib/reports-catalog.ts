export type ReportScopeMode = 'branch' | 'organization';

export type ReportDef = {
  id: string;
  title: string;
  /** Existing route when live; otherwise opens coming-soon detail. */
  href?: string;
  live?: boolean;
};

export type ReportCategory = {
  id: string;
  title: string;
  reports: ReportDef[];
};

export const DEFAULT_FAVOURITE_IDS = [
  'balance-sheet',
  'profit-and-loss',
  'ar-ageing-summary',
] as const;

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'business-overview',
    title: 'Business overview',
    reports: [
      { id: 'audit-log', title: 'Audit Log', href: '/settings/audit-logs', live: true },
      { id: 'balance-sheet', title: 'Balance Sheet', href: '/reports/balance-sheet', live: true },
      { id: 'balance-sheet-comparison', title: 'Balance Sheet Comparison' },
      { id: 'balance-sheet-detail', title: 'Balance Sheet Detail' },
      { id: 'balance-sheet-summary', title: 'Balance Sheet Summary' },
      { id: 'cash-flows', title: 'Statement of Cash Flows' },
      { id: 'business-snapshot', title: 'Business Snapshot' },
      { id: 'changes-in-equity', title: 'Statement of Changes in equity' },
      { id: 'profit-and-loss', title: 'Profit and Loss', href: '/reports/profit-and-loss', live: true },
      { id: 'pl-by-customer', title: 'Profit and Loss by Customer' },
      { id: 'pl-by-month', title: 'Profit and Loss by Month' },
      { id: 'pl-by-tag', title: 'Profit and Loss By Tag Group' },
      { id: 'pl-comparison', title: 'Profit and Loss Comparison' },
      { id: 'pl-detail', title: 'Profit and Loss Detail' },
      { id: 'pl-pct-income', title: 'Profit and Loss as % of total income' },
      { id: 'pl-ytd', title: 'Profit and Loss year-to-date comparison' },
      { id: 'pl-quarterly', title: 'Quarterly Profit and Loss Summary' },
    ],
  },
  {
    id: 'who-owes-you',
    title: 'Who owes you',
    reports: [
      { id: 'ar-ageing-summary', title: 'Accounts receivable ageing summary', href: '/reports/ar-ageing', live: true },
      { id: 'ar-ageing-detail', title: 'Accounts receivable ageing detail', href: '/reports/ar-ageing', live: true },
      { id: 'collections', title: 'Collections Report' },
      { id: 'customer-balance-summary', title: 'Customer Balance Summary' },
      { id: 'customer-balance-detail', title: 'Customer Balance Detail' },
      { id: 'invoice-list', title: 'Invoice List', href: '/account_receivables/invoice', live: true },
      { id: 'invoices-payments', title: 'Invoices and Received Payments' },
      { id: 'open-invoices', title: 'Open Invoices' },
      { id: 'statement-list', title: 'Statement List' },
      { id: 'terms-list', title: 'Terms List' },
      { id: 'unbilled-charges', title: 'Unbilled charges' },
      { id: 'unbilled-time', title: 'Unbilled time' },
    ],
  },
  {
    id: 'what-you-owe',
    title: 'What you owe',
    reports: [
      { id: 'ap-ageing-summary', title: 'Accounts payable ageing summary' },
      { id: 'ap-ageing-detail', title: 'Accounts payable ageing detail' },
      { id: 'bills-payments', title: 'Bills and Applied Payments' },
      { id: 'bill-payment-list', title: 'Bill Payment List' },
      { id: 'unpaid-bills', title: 'Unpaid Bills', href: '/account_payables/bills', live: true },
      { id: 'vendor-balance-summary', title: 'Vendor Balance Summary' },
      { id: 'vendor-balance-detail', title: 'Vendor Balance Detail' },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    reports: [
      { id: 'inv-valuation-detail', title: 'Inventory Valuation Detail' },
      { id: 'inv-valuation-summary', title: 'Inventory Valuation Summary' },
      { id: 'inv-status', title: 'Inventory Status' },
      { id: 'physical-worksheet', title: 'Physical Inventory Worksheet' },
      { id: 'open-po-detail', title: 'Open Purchase Order Detail' },
      { id: 'open-po-list', title: 'Open Purchase Order List', href: '/account_payables/purchase', live: true },
      { id: 'open-so-customer', title: 'Open Sales Order by Customer' },
      { id: 'open-so-item', title: 'Open Sales Order by Item' },
      { id: 'sales-order-list', title: 'Sales Order List' },
    ],
  },
  {
    id: 'sales-customers',
    title: 'Sales and customers',
    reports: [
      { id: 'cashflow-payments', title: 'Cashflow Payment Transactions' },
      { id: 'sales-customer-type', title: 'Sales by Customer Type Detail' },
      { id: 'customer-contact-list', title: 'Customer Contact List', href: '/account_receivables/contacts', live: true },
      { id: 'income-by-customer', title: 'Income by Customer Summary' },
      { id: 'customer-phone-list', title: 'Customer Phone List' },
      { id: 'sales-customer-summary', title: 'Sales by Customer Summary' },
      { id: 'sales-customer-detail', title: 'Sales by Customer Detail' },
      { id: 'deposit-detail', title: 'Deposit Detail' },
      { id: 'estimates-by-customer', title: 'Estimates by Customer' },
      { id: 'product-service-list', title: 'Product/Service List', href: '/inventory', live: true },
      { id: 'sales-product-summary', title: 'Sales by Product/Service Summary' },
      { id: 'sales-product-detail', title: 'Sales by Product/Service Detail' },
      { id: 'payment-method-list', title: 'Payment Method List' },
      { id: 'time-by-customer', title: 'Time Activities by Customer Detail' },
      { id: 'txn-by-customer', title: 'Transaction List by Customer' },
      { id: 'txn-by-tag', title: 'Transaction List by Tag Group' },
    ],
  },
  {
    id: 'expenses-vendors',
    title: 'Expenses and vendors',
    reports: [
      { id: 'cheque-detail', title: 'Cheque Detail' },
      { id: 'purchases-product-detail', title: 'Purchases by Product/Service Detail' },
      { id: 'purchase-list', title: 'Purchase List', href: '/account_payables/purchase', live: true },
      { id: 'txn-by-vendor', title: 'Transaction List by Vendor' },
      { id: 'purchases-vendor-detail', title: 'Purchases by Vendor Detail' },
      { id: 'vendor-contact-list', title: 'Vendor Contact List', href: '/account_payables/contacts', live: true },
      { id: 'expenses-vendor-summary', title: 'Expenses by Vendor Summary' },
      { id: 'vendor-phone-list', title: 'Vendor Phone List' },
    ],
  },
  {
    id: 'sales-tax',
    title: 'Sales tax',
    reports: [{ id: 'tax-liability', title: 'Tax Liability Report' }],
  },
  {
    id: 'employees',
    title: 'Employees',
    reports: [
      { id: 'employee-contact-list', title: 'Employee Contact List' },
      { id: 'recent-time-activities', title: 'Recent/Edited Time Activities' },
      { id: 'time-by-employee', title: 'Time Activities by Employee Detail' },
    ],
  },
  {
    id: 'for-my-accountant',
    title: 'For my accountant',
    reports: [
      { id: 'account-list', title: 'Account List', href: '/accounting', live: true },
      { id: 'balance-sheet-acct', title: 'Balance Sheet', href: '/reports/balance-sheet', live: true },
      { id: 'invalid-journals', title: 'Invalid Journal Transactions' },
      { id: 'general-ledger', title: 'General Ledger', href: '/accounting/ledger', live: true },
      { id: 'general-ledger-list', title: 'General Ledger List', href: '/accounting/ledger', live: true },
      { id: 'journal', title: 'Journal', href: '/accounting/journals', live: true },
      { id: 'recurring-template-list', title: 'Recurring Template List' },
      { id: 'pl-acct', title: 'Profit and Loss', href: '/reports/profit-and-loss', live: true },
      { id: 'recent-transactions', title: 'Recent Transactions' },
      { id: 'reconciliation-reports', title: 'Reconciliation Reports' },
      { id: 'trial-balance', title: 'Trial Balance' },
      { id: 'adjusted-trial-balance', title: 'Adjusted Trial Balance' },
      { id: 'txn-detail-account', title: 'Transaction Detail by Account' },
      { id: 'txn-list-date', title: 'Transaction List by Date' },
      { id: 'txn-list-splits', title: 'Transaction List with Splits' },
    ],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    reports: [
      { id: 'payroll-employee-contact', title: 'Employee Contact List' },
      { id: 'payroll-recent-time', title: 'Recent/Edited Time Activities' },
      { id: 'payroll-time-by-employee', title: 'Time Activities by Employee Detail' },
    ],
  },
  {
    id: 'time',
    title: 'Time',
    reports: [
      { id: 'timesheet-by-employee', title: 'Timesheet Detail by Employee' },
      { id: 'time-summary-pay-type', title: 'Time Summary by Pay Type' },
    ],
  },
];

export function allReports(): ReportDef[] {
  return REPORT_CATEGORIES.flatMap((c) => c.reports);
}

export function findReport(id: string): ReportDef | undefined {
  return allReports().find((r) => r.id === id);
}
