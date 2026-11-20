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
      { id: 'balance-sheet-comparison', title: 'Balance Sheet Comparison', href: '/reports/view/balance-sheet-comparison', live: true },
      { id: 'balance-sheet-detail', title: 'Balance Sheet Detail', href: '/reports/view/balance-sheet-detail', live: true },
      { id: 'balance-sheet-summary', title: 'Balance Sheet Summary', href: '/reports/view/balance-sheet-summary', live: true },
      { id: 'cash-flows', title: 'Statement of Cash Flows', href: '/reports/view/cash-flows', live: true },
      { id: 'business-snapshot', title: 'Business Snapshot', href: '/reports/view/business-snapshot', live: true },
      { id: 'changes-in-equity', title: 'Statement of Changes in equity', href: '/reports/view/changes-in-equity', live: true },
      { id: 'profit-and-loss', title: 'Profit and Loss', href: '/reports/profit-and-loss', live: true },
      { id: 'pl-by-customer', title: 'Profit and Loss by Customer', href: '/reports/view/pl-by-customer', live: true },
      { id: 'pl-by-month', title: 'Profit and Loss by Month', href: '/reports/view/pl-by-month', live: true },
      { id: 'pl-by-tag', title: 'Profit and Loss By Tag Group', href: '/reports/view/pl-by-tag', live: true },
      { id: 'pl-comparison', title: 'Profit and Loss Comparison', href: '/reports/view/pl-comparison', live: true },
      { id: 'pl-detail', title: 'Profit and Loss Detail', href: '/reports/view/pl-detail', live: true },
      { id: 'pl-pct-income', title: 'Profit and Loss as % of total income', href: '/reports/view/pl-pct-income', live: true },
      { id: 'pl-ytd', title: 'Profit and Loss year-to-date comparison', href: '/reports/view/pl-ytd', live: true },
      { id: 'pl-quarterly', title: 'Quarterly Profit and Loss Summary', href: '/reports/view/pl-quarterly', live: true },
    ],
  },
  {
    id: 'who-owes-you',
    title: 'Who owes you',
    reports: [
      { id: 'ar-ageing-summary', title: 'Accounts receivable ageing summary', href: '/reports/ar-ageing', live: true },
      { id: 'ar-ageing-detail', title: 'Accounts receivable ageing detail', href: '/reports/ar-ageing-detail', live: true },
      { id: 'collections', title: 'Collections Report', href: '/reports/view/collections', live: true },
      { id: 'customer-balance-summary', title: 'Customer Balance Summary', href: '/reports/view/customer-balance-summary', live: true },
      { id: 'customer-balance-detail', title: 'Customer Balance Detail', href: '/reports/view/customer-balance-detail', live: true },
      { id: 'invoice-list', title: 'Invoice List', href: '/account_receivables/invoice', live: true },
      { id: 'invoices-payments', title: 'Invoices and Received Payments', href: '/reports/view/invoices-payments', live: true },
      { id: 'open-invoices', title: 'Open Invoices', href: '/reports/view/open-invoices', live: true },
      { id: 'statement-list', title: 'Statement List', href: '/reports/view/statement-list', live: true },
      { id: 'terms-list', title: 'Terms List', href: '/reports/view/terms-list', live: true },
      { id: 'unbilled-charges', title: 'Unbilled charges', href: '/reports/view/unbilled-charges', live: true },
      { id: 'unbilled-time', title: 'Unbilled time', href: '/reports/view/unbilled-time', live: true },
    ],
  },
  {
    id: 'what-you-owe',
    title: 'What you owe',
    reports: [
      { id: 'ap-ageing-summary', title: 'Accounts payable ageing summary', href: '/reports/ap-ageing', live: true },
      { id: 'ap-ageing-detail', title: 'Accounts payable ageing detail', href: '/reports/ap-ageing-detail', live: true },
      { id: 'bills-payments', title: 'Bills and Applied Payments', href: '/reports/view/bills-payments', live: true },
      { id: 'bill-payment-list', title: 'Bill Payment List', href: '/reports/view/bill-payment-list', live: true },
      { id: 'unpaid-bills', title: 'Unpaid Bills', href: '/account_payables/bills', live: true },
      { id: 'vendor-balance-summary', title: 'Vendor Balance Summary', href: '/reports/view/vendor-balance-summary', live: true },
      { id: 'vendor-balance-detail', title: 'Vendor Balance Detail', href: '/reports/view/vendor-balance-detail', live: true },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    reports: [
      { id: 'inv-valuation-detail', title: 'Inventory Valuation Detail', href: '/reports/view/inv-valuation-detail', live: true },
      { id: 'inv-valuation-summary', title: 'Inventory Valuation Summary', href: '/reports/view/inv-valuation-summary', live: true },
      { id: 'inv-status', title: 'Inventory Status', href: '/reports/view/inv-status', live: true },
      { id: 'physical-worksheet', title: 'Physical Inventory Worksheet', href: '/reports/view/physical-worksheet', live: true },
      { id: 'open-po-detail', title: 'Open Purchase Order Detail', href: '/reports/view/open-po-detail', live: true },
      { id: 'open-po-list', title: 'Open Purchase Order List', href: '/account_payables/purchase', live: true },
      { id: 'open-so-customer', title: 'Open Sales Order by Customer', href: '/reports/view/open-so-customer', live: true },
      { id: 'open-so-item', title: 'Open Sales Order by Item', href: '/reports/view/open-so-item', live: true },
      { id: 'sales-order-list', title: 'Sales Order List', href: '/reports/view/sales-order-list', live: true },
    ],
  },
  {
    id: 'sales-customers',
    title: 'Sales and customers',
    reports: [
      { id: 'cashflow-payments', title: 'Cashflow Payment Transactions', href: '/reports/view/cashflow-payments', live: true },
      { id: 'sales-customer-type', title: 'Sales by Customer Type Detail', href: '/reports/view/sales-customer-type', live: true },
      { id: 'customer-contact-list', title: 'Customer Contact List', href: '/account_receivables/contacts', live: true },
      { id: 'income-by-customer', title: 'Income by Customer Summary', href: '/reports/view/income-by-customer', live: true },
      { id: 'customer-phone-list', title: 'Customer Phone List', href: '/reports/view/customer-phone-list', live: true },
      { id: 'sales-customer-summary', title: 'Sales by Customer Summary', href: '/reports/view/sales-customer-summary', live: true },
      { id: 'sales-customer-detail', title: 'Sales by Customer Detail', href: '/reports/view/sales-customer-detail', live: true },
      { id: 'deposit-detail', title: 'Deposit Detail', href: '/reports/view/deposit-detail', live: true },
      { id: 'estimates-by-customer', title: 'Estimates by Customer', href: '/reports/view/estimates-by-customer', live: true },
      { id: 'product-service-list', title: 'Product/Service List', href: '/inventory', live: true },
      { id: 'sales-product-summary', title: 'Sales by Product/Service Summary', href: '/reports/view/sales-product-summary', live: true },
      { id: 'sales-product-detail', title: 'Sales by Product/Service Detail', href: '/reports/view/sales-product-detail', live: true },
      { id: 'payment-method-list', title: 'Payment Method List', href: '/reports/view/payment-method-list', live: true },
      { id: 'time-by-customer', title: 'Time Activities by Customer Detail', href: '/reports/view/time-by-customer', live: true },
      { id: 'txn-by-customer', title: 'Transaction List by Customer', href: '/reports/view/txn-by-customer', live: true },
      { id: 'txn-by-tag', title: 'Transaction List by Tag Group', href: '/reports/view/txn-by-tag', live: true },
    ],
  },
  {
    id: 'expenses-vendors',
    title: 'Expenses and vendors',
    reports: [
      { id: 'cheque-detail', title: 'Cheque Detail', href: '/reports/view/cheque-detail', live: true },
      { id: 'purchases-product-detail', title: 'Purchases by Product/Service Detail', href: '/reports/view/purchases-product-detail', live: true },
      { id: 'purchase-list', title: 'Purchase List', href: '/account_payables/purchase', live: true },
      { id: 'txn-by-vendor', title: 'Transaction List by Vendor', href: '/reports/view/txn-by-vendor', live: true },
      { id: 'purchases-vendor-detail', title: 'Purchases by Vendor Detail', href: '/reports/view/purchases-vendor-detail', live: true },
      { id: 'vendor-contact-list', title: 'Vendor Contact List', href: '/account_payables/contacts', live: true },
      { id: 'expenses-vendor-summary', title: 'Expenses by Vendor Summary', href: '/reports/view/expenses-vendor-summary', live: true },
      { id: 'vendor-phone-list', title: 'Vendor Phone List', href: '/reports/view/vendor-phone-list', live: true },
    ],
  },
  {
    id: 'sales-tax',
    title: 'Sales tax',
    reports: [{ id: 'tax-liability', title: 'Tax Liability Report', href: '/reports/view/tax-liability', live: true }],
  },
  {
    id: 'employees',
    title: 'Employees',
    reports: [
      { id: 'employee-contact-list', title: 'Employee Contact List', href: '/reports/view/employee-contact-list', live: true },
      { id: 'recent-time-activities', title: 'Recent/Edited Time Activities', href: '/reports/view/recent-time-activities', live: true },
      { id: 'time-by-employee', title: 'Time Activities by Employee Detail', href: '/reports/view/time-by-employee', live: true },
    ],
  },
  {
    id: 'for-my-accountant',
    title: 'For my accountant',
    reports: [
      { id: 'account-list', title: 'Account List', href: '/accounting', live: true },
      { id: 'balance-sheet-acct', title: 'Balance Sheet', href: '/reports/balance-sheet', live: true },
      { id: 'invalid-journals', title: 'Invalid Journal Transactions', href: '/reports/view/invalid-journals', live: true },
      { id: 'general-ledger', title: 'General Ledger', href: '/accounting/ledger', live: true },
      { id: 'general-ledger-list', title: 'General Ledger List', href: '/accounting/ledger', live: true },
      { id: 'journal', title: 'Journal', href: '/accounting/journals', live: true },
      { id: 'recurring-template-list', title: 'Recurring Template List', href: '/reports/view/recurring-template-list', live: true },
      { id: 'pl-acct', title: 'Profit and Loss', href: '/reports/profit-and-loss', live: true },
      { id: 'recent-transactions', title: 'Recent Transactions', href: '/reports/view/recent-transactions', live: true },
      { id: 'reconciliation-reports', title: 'Reconciliation Reports', href: '/reports/view/reconciliation-reports', live: true },
      { id: 'trial-balance', title: 'Trial Balance', href: '/reports/view/trial-balance', live: true },
      { id: 'adjusted-trial-balance', title: 'Adjusted Trial Balance', href: '/reports/view/adjusted-trial-balance', live: true },
      { id: 'txn-detail-account', title: 'Transaction Detail by Account', href: '/reports/view/txn-detail-account', live: true },
      { id: 'txn-list-date', title: 'Transaction List by Date', href: '/reports/view/txn-list-date', live: true },
      { id: 'txn-list-splits', title: 'Transaction List with Splits', href: '/reports/view/txn-list-splits', live: true },
    ],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    reports: [
      { id: 'payroll-employee-contact', title: 'Employee Contact List', href: '/reports/view/payroll-employee-contact', live: true },
      { id: 'payroll-recent-time', title: 'Recent/Edited Time Activities', href: '/reports/view/payroll-recent-time', live: true },
      { id: 'payroll-time-by-employee', title: 'Time Activities by Employee Detail', href: '/reports/view/payroll-time-by-employee', live: true },
    ],
  },
  {
    id: 'time',
    title: 'Time',
    reports: [
      { id: 'timesheet-by-employee', title: 'Timesheet Detail by Employee', href: '/reports/view/timesheet-by-employee', live: true },
      { id: 'time-summary-pay-type', title: 'Time Summary by Pay Type', href: '/reports/view/time-summary-pay-type', live: true },
    ],
  },
];

export function allReports(): ReportDef[] {
  return REPORT_CATEGORIES.flatMap((c) => c.reports);
}

export function findReport(id: string): ReportDef | undefined {
  return allReports().find((r) => r.id === id);
}
