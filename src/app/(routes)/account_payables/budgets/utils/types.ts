export type BudgetStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type ApprovalRequirement = 'one' | 'at_least' | 'all';
export type RecurrenceType =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUALLY'
  | 'NONE';

export interface BudgetedAccount {
  uuid: string;
  name: string;
  code: string;
  type: string;
  isActive: boolean;
  initialBalance: string;
  branchId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  path: string | null;
}

export interface Policy {
  uuid: string;
  name: string;
  documentUrl: string | null;
  type: string | null;
  status: string;
  budgetId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface Approver {
  uuid: string;
  budgetId: string;
  approverId: string;
  approver?: {
    firstName?: string | null;
    lastName?: string | null;
    profile_url?: string | null;
  } | null;
  approved: boolean;
  branchId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

export interface Budget {
  uuid: string;
  budgetId: string;
  name: string;
  description: string;
  totalAmount: string;
  availableAmount: string;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  organizationId: string;
  branchId: string;
  approvalRequirement: ApprovalRequirement;
  requiredApprovals: number;
  budgetedAccountId: string;
  recurrenceType: RecurrenceType;
  recurrenceInterval: string | null;
  recurrenceEndDate: string | null;
  originalBudgetId: string | null;
  isRecurringParent: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  budgetedAccount: BudgetedAccount;
  policies: Policy[];
  approvers: Approver[];
}

export interface BudgetResponse {
  data: Budget[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: [string, string][];
  };
  links: {
    current: string;
  };
}

// Mock user type for the avatar display in BudgetCard
export interface User {
  id: string;
  imageUrl?: string;
  initials: string;
}
