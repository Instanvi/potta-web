import { hasAnyPermission } from '@/lib/permissions';

export type PermissionRequirement = {
  resource: string;
  action: string | string[];
};

/** Passes when any requirement is met. */
export type PermissionCheck = PermissionRequirement | { anyOf: PermissionRequirement[] };

export function satisfiesPermission(
  permissions: Record<string, string[]> | null | undefined,
  check: PermissionCheck,
): boolean {
  const reqs = 'anyOf' in check ? check.anyOf : [check];
  return reqs.some((req) =>
    hasAnyPermission(permissions, req.resource, Array.isArray(req.action) ? req.action : [req.action]),
  );
}

/** Longest prefix wins. Routes without an entry are open to any signed-in user. */
export const ROUTE_PERMISSIONS: { path: string; permission: PermissionCheck }[] = [
  // The till lists products (Item:view-all); completing a sale also needs SalesReciept:create (checked on the button).
  { path: '/pos', permission: { resource: 'Item', action: 'view-all' } },
  { path: '/pos/sales', permission: { resource: 'SalesReciept', action: ['view', 'view-all'] } },
  { path: '/pos/sales/new', permission: { resource: 'SalesReciept', action: 'create' } },
  { path: '/pos/inventory', permission: { resource: 'Item', action: ['view', 'view-all'] } },
  { path: '/inventory', permission: { resource: 'Item', action: ['view', 'view-all'] } },
  {
    path: '/pos/contacts',
    permission: {
      anyOf: [
        { resource: 'Customer', action: ['view', 'view-all'] },
        { resource: 'Vendor', action: ['view', 'view-all'] },
      ],
    },
  },
  { path: '/pos/customers', permission: { resource: 'Customer', action: ['view', 'view-all'] } },
  { path: '/pos/vendors', permission: { resource: 'Vendor', action: ['view', 'view-all'] } },
  {
    path: '/contacts',
    permission: {
      anyOf: [
        { resource: 'Customer', action: ['view', 'view-all'] },
        { resource: 'Vendor', action: ['view', 'view-all'] },
      ],
    },
  },
  { path: '/pos/sync', permission: { resource: 'Transactions', action: 'view' } },
  { path: '/accounting', permission: { resource: 'Accounts', action: ['view', 'view-all', 'view-tree'] } },
  { path: '/accounting/journals', permission: { resource: 'JournalEntries', action: ['view', 'view-all'] } },
  {
    path: '/accounting/ledger',
    permission: {
      anyOf: [
        { resource: 'GeneralLedger', action: ['view-all', 'view-transactions'] },
        { resource: 'Ledger', action: ['view-entries', 'view-sub-ledgers'] },
      ],
    },
  },
  {
    path: '/accounting/reports',
    permission: {
      anyOf: [
        { resource: 'GeneralLedger', action: ['view-balance-sheet', 'income-statement'] },
        { resource: 'Ledger', action: ['view-balance-sheet', 'view-income-statement'] },
        { resource: 'Report', action: ['view', 'view-organization'] },
      ],
    },
  },
  {
    path: '/reports',
    permission: {
      anyOf: [
        { resource: 'GeneralLedger', action: ['view-balance-sheet', 'income-statement', 'view-all'] },
        { resource: 'Ledger', action: ['view-balance-sheet', 'view-income-statement', 'view-entries', 'view-organization'] },
        { resource: 'Report', action: ['view', 'view-organization'] },
      ],
    },
  },
  {
    path: '/home',
    permission: {
      anyOf: [
        { resource: 'Dashboard', action: 'view' },
        // Legacy fallbacks until roles are granted Dashboard:view
        { resource: 'Report', action: ['view', 'view-organization'] },
        { resource: 'Invoice', action: 'view-all' },
        { resource: 'Ledger', action: ['view-balance-sheet', 'view-entries'] },
      ],
    },
  },
  {
    path: '/dashboards',
    permission: {
      anyOf: [
        { resource: 'Dashboard', action: 'view' },
        { resource: 'Report', action: ['view', 'view-organization'] },
        { resource: 'Invoice', action: 'view-all' },
        { resource: 'Ledger', action: ['view-balance-sheet', 'view-entries'] },
      ],
    },
  },
  { path: '/accounting/cashbook', permission: { resource: 'Cashbook', action: 'view' } },
  { path: '/accounting/bank-transactions', permission: { resource: 'BankAccounts', action: ['view', 'view-all'] } },
  {
    path: '/accounting/integration-transactions',
    permission: {
      anyOf: [
        { resource: 'JournalEntries', action: ['view', 'view-all', 'create'] },
        { resource: 'Transactions', action: ['view', 'view-all'] },
      ],
    },
  },
  { path: '/accounting/reconcile', permission: { resource: 'BankAccounts', action: ['view', 'view-all'] } },
  { path: '/accounting/rules', permission: { resource: 'Accounts', action: ['view', 'view-all'] } },
  { path: '/accounting/taxes', permission: { resource: 'Tax', action: ['view', 'view-all'] } },
  { path: '/tax', permission: { resource: 'Tax', action: ['view', 'view-all'] } },
  { path: '/account_receivables', permission: { resource: 'Invoice', action: 'view-all' } },
  { path: '/account_receivables/invoice', permission: { resource: 'Invoice', action: ['view', 'view-all'] } },
  { path: '/account_receivables/recurring', permission: { resource: 'Invoice', action: ['view', 'view-all'] } },
  { path: '/account_receivables/credit', permission: { resource: 'CreditNote', action: 'view' } },
  { path: '/account_receivables/sales_receipts', permission: { resource: 'SalesReciept', action: ['view', 'view-all'] } },
  { path: '/account_receivables/vouchers', permission: { resource: 'Vouchers', action: 'view' } },
  { path: '/account_receivables/payments', permission: { resource: 'ArPayment', action: ['view', 'view-all'] } },
  { path: '/account_receivables/transactions', permission: { resource: 'Invoice', action: ['view', 'view-all'] } },
  { path: '/account_receivables/estimates', permission: { resource: 'Estimate', action: ['view', 'view-all'] } },
  { path: '/account_receivables/sales-orders', permission: { resource: 'SalesOrder', action: ['view', 'view-all'] } },
  { path: '/account_receivables/opportunities', permission: { resource: 'Opportunity', action: ['view', 'view-all'] } },
  { path: '/account_receivables/proposals', permission: { resource: 'Proposal', action: ['view', 'view-all'] } },
  { path: '/account_receivables/contracts', permission: { resource: 'Contract', action: ['view', 'view-all'] } },
  {
    path: '/account_receivables/contacts',
    permission: {
      anyOf: [
        { resource: 'Customer', action: ['view', 'view-all'] },
        { resource: 'Vendor', action: ['view', 'view-all'] },
        { resource: 'Lead', action: ['view', 'view-all'] },
      ],
    },
  },
  { path: '/account_receivables/customers', permission: { resource: 'Customer', action: ['view', 'view-all'] } },
  { path: '/account_payables', permission: { resource: 'Bill', action: 'view-all' } },
  { path: '/account_payables/bills', permission: { resource: 'Bill', action: ['view', 'view-all'] } },
  { path: '/account_payables/payments', permission: { resource: 'ApPayment', action: ['view', 'view-all'] } },
  { path: '/account_payables/expenses', permission: { resource: 'Bill', action: ['view', 'view-all'] } },
  { path: '/account_payables/credits', permission: { resource: 'SupplierCredit', action: ['view', 'view-all'] } },
  { path: '/account_payables/transactions', permission: { resource: 'Bill', action: ['view', 'view-all'] } },
  { path: '/account_payables/purchase', permission: { resource: 'PurchaseOrder', action: ['view', 'view-all'] } },
  {
    path: '/account_payables/contacts',
    permission: {
      anyOf: [
        { resource: 'Customer', action: ['view', 'view-all'] },
        { resource: 'Vendor', action: ['view', 'view-all'] },
      ],
    },
  },
  { path: '/account_payables/vendors', permission: { resource: 'Vendor', action: ['view', 'view-all'] } },
  { path: '/inventory/overview', permission: { resource: 'Item', action: ['view', 'view-all'] } },
  { path: '/inventory/receipts', permission: { resource: 'ItemReceipt', action: ['view', 'view-all'] } },
  { path: '/inventory/shipments', permission: { resource: 'Shipment', action: ['view', 'view-all'] } },
  { path: '/accounting/employees', permission: { resource: 'Accounts', action: ['view', 'view-all'] } },
  { path: '/accounting/projects', permission: { resource: 'Project', action: ['view', 'view-all'] } },
  { path: '/accounting/assets', permission: { resource: 'FixedAsset', action: ['view', 'view-all'] } },
  { path: '/accounting/opening-balances', permission: { resource: 'OpeningBalance', action: ['view', 'view-all'] } },
  { path: '/accounting/period-close', permission: { resource: 'PeriodClose', action: ['view', 'view-all'] } },
  { path: '/accounting/recurring', permission: { resource: 'RecurringTemplate', action: ['view', 'view-all'] } },
  { path: '/accounting/bank-transactions', permission: { resource: 'BankTransaction', action: ['view', 'view-all'] } },
  { path: '/accounting/reconcile', permission: { resource: 'BankReconciliation', action: ['view', 'view-all'] } },
  { path: '/accounting/rules', permission: { resource: 'BankRule', action: ['view', 'view-all'] } },
  { path: '/treasury/bank-accounts', permission: { resource: 'BankAccounts', action: ['view', 'view-all'] } },
  {
    path: '/settings/audit-logs',
    permission: {
      anyOf: [
        { resource: 'AuditLog', action: 'view' },
        { resource: 'NotificationLog', action: 'view' },
      ],
    },
  },
];

const SORTED = [...ROUTE_PERMISSIONS].sort((a, b) => b.path.length - a.path.length);

export function getRoutePermission(pathname: string): PermissionCheck | null {
  const entry = SORTED.find((e) => pathname === e.path || pathname.startsWith(`${e.path}/`));
  return entry?.permission ?? null;
}
