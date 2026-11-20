// Resources and actions checked by potta-backend's @Permissions guards.
// Mirrored in instanvi-auth-starter (src/roles/potta-permissions.catalog.ts) and in the
// auth frontend role editor; keep the three in sync.

export interface PermissionDefinition {
  resource: string;
  action: string[];
}

export const PottaAppPermissions: PermissionDefinition[] = [
  { resource: 'Accounts', action: ['create', 'view', 'view-all', 'view-descendants', 'view-parent', 'view-tree'] },
  {
    resource: 'BankAccounts',
    action: ['create', 'deactivate', 'get-current-balance', 'update', 'view', 'view-all'],
  },
  { resource: 'AuditLog', action: ['view'] },
  { resource: 'Bill', action: ['approve', 'create', 'pay', 'reject', 'view', 'view-all'] },
  { resource: 'Cashbook', action: ['create', 'remove', 'update', 'view'] },
  { resource: 'CreditNote', action: ['add-invoice', 'approve', 'create', 'refund', 'remove', 'update', 'view'] },
  { resource: 'Customer', action: ['create', 'remove', 'update', 'view', 'view-all'] },
  { resource: 'Customers', action: ['view'] },
  /** Home + custom KPI layouts (potta-backend dashboards module). */
  { resource: 'Dashboard', action: ['view', 'create', 'update', 'delete'] },
  {
    resource: 'GeneralLedger',
    action: [
      'income-statement',
      'view-account-balance',
      'view-all',
      'view-balance-sheet',
      'view-period-balance',
      'view-transactions',
    ],
  },
  {
    resource: 'Invoice',
    action: [
      'add-line-item',
      'approve',
      'create',
      'pay',
      'reject',
      'remove',
      'remove-line-item',
      'update',
      'view',
      'view-all',
      'view-for-customer',
    ],
  },
  { resource: 'Item', action: ['create', 'export', 'import-csv', 'read', 'remove', 'restock', 'update', 'view', 'view-all'] },
  { resource: 'NotificationLog', action: ['view'] },
  { resource: 'ItemCategory', action: ['create', 'delete', 'import-csv', 'update', 'view', 'view-all'] },
  { resource: 'JournalEntries', action: ['create', 'delete', 'view', 'view-all'] },
  {
    resource: 'Ledger',
    action: [
      'view-balance-sheet',
      'view-entries',
      'view-income-statement',
      'view-sub-ledger-balance',
      'view-sub-ledger-transactions',
      'view-sub-ledgers',
    ],
  },
  {
    resource: 'PurchaseOrder',
    action: [
      'add-line-item',
      'approve',
      'create',
      'remove',
      'remove-line-item',
      'update',
      'view',
      'view-all',
      'view-vendor-orders',
    ],
  },
  /** Saved/org reports runner (potta-backend reports module). */
  { resource: 'Report', action: ['view', 'view-organization', 'export'] },
  { resource: 'SalesReciept', action: ['create', 'remove', 'view', 'view-all'] },
  { resource: 'Tax', action: ['create', 'remove', 'update', 'view', 'view-all'] },
  { resource: 'Transactions', action: ['create', 'view'] },
  { resource: 'Vendor', action: ['create', 'remove', 'update', 'view', 'view-all'] },
  { resource: 'Vendors', action: ['view'] },
  { resource: 'Vouchers', action: ['activate-gift-card', 'create', 'delete', 'gift-card-balance', 'view'] },
  { resource: 'Estimate', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'SalesOrder', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'ArPayment', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'ApPayment', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'SupplierCredit', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'ItemReceipt', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'Shipment', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  {
    resource: 'BankTransaction',
    action: ['create', 'update', 'remove', 'view', 'view-all', 'match', 'accept', 'exclude', 'import'],
  },
  { resource: 'BankReconciliation', action: ['create', 'view', 'view-all', 'clear', 'finish', 'undo'] },
  { resource: 'BankRule', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'TaxFiling', action: ['create', 'update', 'view', 'view-all', 'prepare', 'submit', 'pay'] },
  { resource: 'OpeningBalance', action: ['create', 'update', 'view', 'view-all', 'post'] },
  { resource: 'PeriodClose', action: ['create', 'view', 'view-all', 'close', 'reopen'] },
  { resource: 'Project', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'FixedAsset', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'Lead', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'Opportunity', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'Proposal', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'Contract', action: ['create', 'update', 'remove', 'view', 'view-all'] },
  { resource: 'RecurringTemplate', action: ['create', 'update', 'remove', 'view', 'view-all'] },
];

function allowedActions(permissions: Record<string, string[]> | null | undefined, resource: string): string[] {
  if (!permissions) return [];
  const direct = permissions[resource];
  if (direct) return direct;
  const key = Object.keys(permissions).find((k) => k.toLowerCase() === resource.toLowerCase());
  return key ? permissions[key] : [];
}

export function hasPermission(
  permissions: Record<string, string[]> | null | undefined,
  resource: string,
  action: string,
): boolean {
  const allowed = allowedActions(permissions, resource);
  return allowed.includes(action) || allowed.includes('*');
}

export function hasAnyPermission(
  permissions: Record<string, string[]> | null | undefined,
  resource: string,
  actions: string[],
): boolean {
  return actions.some((a) => hasPermission(permissions, resource, a));
}
