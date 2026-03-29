// ─── Potta App Permission Definitions ──────────────────────────────────────────
// Source of truth for all HR / Finance / Employee resource/action permissions.
// Used by the Can component for runtime authorization checks.
// ────────────────────────────────────────────────────────────────────────────────

export interface PermissionDefinition {
  resource: string;
  action: string[];
}

export const PottaAppPermissions: PermissionDefinition[] = [
  {
    resource: "Employee",
    action: [
      "view",
      "create",
      "update",
      "delete",
      "view-pay-schedule",
      "view-employment-status",
      "view-compensation-type",
      "view-full-name",
      "create-benefit",
      "create-paid-time-off",
      "calculate-pay-schedule",
      "deactivate-account",
    ],
  },
  {
    resource: "Benefit",
    action: [
      "view",
      "create",
      "update",
      "delete",
      "view-benefit-account",
      "create-benefit-account",
      "update-benefit-account",
      "delete-benefit-account",
      "check-expired",
    ],
  },
  {
    resource: "Deduction",
    action: [
      "create",
      "view",
      "delete",
      "update-brackets",
      "deactivate",
      "calculate",
      "is-applicable",
    ],
  },
  {
    resource: "EmployeeSpendRequest",
    action: [
      "view",
      "view-all",
      "view-pending",
      "request",
      "approve",
      "update",
      "reject",
      "reconcile",
    ],
  },
  {
    resource: "PaidTimeOff",
    action: [
      "create",
      "view",
      "accrue",
      "request-leave",
      "reject-leave",
      "approve-leave",
      "assign-pto",
      "reset-cycle",
    ],
  },
  {
    resource: "Payshedule",
    action: [
      "view",
      "create",
      "update",
      "delete",
      "calculate",
      "is-due-today",
      "get-description",
    ],
  },
  {
    resource: "PaySlip",
    action: ["view", "create", "update", "mark-as-paid", "export", "delete"],
  },
  {
    resource: "Shift",
    action: [
      "view",
      "create",
      "update",
      "mark-as-paid",
      "export",
      "delete",
      "assign",
      "calculate-overtime",
    ],
  },
  {
    resource: "TimeSheet",
    action: ["view", "create", "update", "approve-overtime", "reject-overtime"],
  },
  {
    resource: "SpendPolicy",
    action: ["view", "create", "create-workflow", "view-workflows", "delete"],
  },
  {
    resource: "Reimbursement",
    action: ["view", "submit", "approve", "pay", "delete"],
  },
  {
    resource: "SpendProgram",
    action: ["view", "create", "update", "update-program", "delete"],
  },
  {
    resource: "Vouchers",
    action: [
      "view",
      "create",
      "update",
      "update-program",
      "delete",
      "apply",
      "gift-card-balance",
      "activate-gift-card",
    ],
  },
  {
    resource: "Accounts",
    action: [
      "view",
      "view-all",
      "view-tree",
      "view-descendants",
      "view-parent",
      "create",
    ],
  },
  {
    resource: "Transactions",
    action: [
      "view",
      "view-all",
      "view-tree",
      "view-status",
      "view-descendants",
      "view-parent",
      "create",
    ],
  },
  {
    resource: "JournalEntries",
    action: ["view", "view-all", "create"],
  },
  {
    resource: "GeneralLedger",
    action: [
      "view",
      "view-all",
      "view-transactions",
      "view-account-balance",
      "view-period-balance",
      "view-balance-sheet",
      "income-statement",
    ],
  },
  {
    resource: "Ledger",
    action: [
      "view-entries",
      "view-all",
      "view-transactions",
      "view-account-balance",
      "view-period-balance",
      "view-balance-sheet",
      "view-income-statement",
      "view-sub-ledgers",
      "view-sub-ledger-transactions",
      "view-sub-ledger-balance",
    ],
  },
  {
    resource: "Assets",
    action: [
      "create",
      "update",
      "view",
      "depreciate",
      "dispose",
      "view-depreciation-schedule",
      "transfer-location",
      "restore",
      "delete",
    ],
  },
  {
    resource: "BankAccounts",
    action: [
      "create",
      "update",
      "view-all",
      "view",
      "deactivate",
      "get-current-balance",
    ],
  },
  {
    resource: "Budget",
    action: [
      "create",
      "update",
      "view-all",
      "view",
      "view-archived",
      "view-account",
      "fund",
      "archived",
      "delete",
      "view-usage-stats",
      "view-transactions",
      "view-trends",
    ],
  },
  {
    resource: "Documents",
    action: [
      "upload",
      "upload-bulk",
      "upload-product-image",
      "upload-product-bulk",
      "view-all",
      "view",
      "download",
    ],
  },
  {
    resource: "Folder",
    action: [
      "create",
      "view",
      "delete",
      "batch-delete",
      "batch-move",
      "batch-download",
      "bulk-download",
      "move-rename",
      "preview",
    ],
  },
  {
    resource: "Bill",
    action: ["create", "view", "view-all", "approve", "reject"],
  },
  {
    resource: "CreditNote",
    action: ["create", "view", "view-all", "add-invoice", "update", "remove"],
  },
  {
    resource: "Invoice",
    action: [
      "create",
      "view",
      "view-all",
      "view-for-customer",
      "add-line-item",
      "remove-line-item",
      "update",
      "remove",
      "approve",
    ],
  },
  {
    resource: "PurchaseOrder",
    action: [
      "create",
      "view",
      "view-all",
      "view-for-customer",
      "add-line-item",
      "remove-line-item",
      "update",
      "remove",
      "approve",
    ],
  },
  {
    resource: "SalesReciept",
    action: ["create", "view", "view-all", "update", "remove"],
  },
  {
    resource: "Customer",
    action: ["create", "view", "view-all", "update", "remove", "import-csv"],
  },
  {
    resource: "ItemCategory",
    action: ["create", "view", "view-all", "update", "remove", "import-csv"],
  },
  {
    resource: "Item",
    action: [
      "create",
      "view",
      "view-all",
      "update",
      "remove",
      "import-csv",
      "restock",
    ],
  },
  {
    resource: "Tax",
    action: [
      "create",
      "view",
      "view-all",
      "update",
      "remove",
      "import-csv",
      "restock",
    ],
  },
  {
    resource: "Vendor",
    action: [
      "create",
      "view",
      "view-all",
      "update",
      "remove",
      "import-csv",
      "restock",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(
  permissions: Record<string, string[]> | null | undefined,
  resource: string,
  action: string,
): boolean {
  if (!permissions) return false;
  const allowed = permissions[resource];
  if (!allowed) return false;
  return allowed.includes(action);
}

export function hasAnyPermission(
  permissions: Record<string, string[]> | null | undefined,
  resource: string,
  actions: string[],
): boolean {
  if (!permissions) return false;
  const allowed = permissions[resource];
  if (!allowed) return false;
  return actions.some((a) => allowed.includes(a));
}
