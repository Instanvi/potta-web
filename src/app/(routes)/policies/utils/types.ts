export interface MileageRequirements {
  requireBeforeAfterScreenshots: boolean;
  requireGpsCoordinates: boolean;
  businessPurpose: boolean;
}

export interface Condition {
  id: string;
  criterionType: string;
  comparisonOperator: string;
  value: number;
}

export interface Action {
  id: string;
  type: string;
  parameters: {
    originalActionType?: string;
    approverType?: string;
    selectedUserIds?: string[];
    approvalMode?: string;
    users?: string[];
    [key: string]: any;
  };
}

export interface Rule {
  uuid?: string;
  id?: string;
  conditionOperator?: string;
  conditions: Condition[];
  actions: Action[];
  requirements?: Record<string, boolean>;
}

export interface Policy {
  uuid: string;
  name: string;
  documentUrl?: string | null;
  requireReceipt?: boolean;
  requireMemo?: boolean;
  requireScreenshots?: boolean;
  requireNetSuiteCustomerJob?: boolean;
  additionalRequirements?: string | null;
  transactionType?: string;
  type?: string;
  mileageRequirements?: MileageRequirements | null;
  branchId?: string;
  rules: Rule[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ApiResponse {
  data: Policy[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export type IFilter = {
  limit: number;
  page: number;
  sortOrder: string;
  sortBy: string;
};

export type IOption = {
  value: string;
  label: string;
};
