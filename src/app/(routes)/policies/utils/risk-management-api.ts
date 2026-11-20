import axios from 'config/axios.config';

// Risk Management API v2 Types
export interface RiskPolicy {
  uuid: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  name: string;
  description: string;
  category: RiskCategory;
  transactionTypes: TransactionType[];
  severity: RiskSeverity;
  enabled: boolean;
  scope: Record<string, any>;
  submissionRequirements: Record<string, any> | null;
  budgetId: string | null;
  rules?: RiskRule[];
  actions?: RiskAction[];
}

export interface RiskRule {
  operator: 'AND' | 'OR';
  conditions: RiskCondition[];
  actions: RiskAction[];
}

export interface RiskCondition {
  field: string;
  operator: RiskOperator;
  value: any;
}

export interface RiskAction {
  type: RiskActionType;
  params: Record<string, any>;
}

export enum RiskCategory {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  LIQUIDITY = 'LIQUIDITY',
}

export enum TransactionType {
  SALES_ORDER = 'SALES_ORDER',
  INVOICE = 'INVOICE',
  CASH_SALE = 'CASH_SALE',
  CREDIT_MEMO = 'CREDIT_MEMO',
  RETURN_AUTHORIZATION = 'RETURN_AUTHORIZATION',
  CUSTOMER_PAYMENT = 'CUSTOMER_PAYMENT',
  ESTIMATE_QUOTE = 'ESTIMATE_QUOTE',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  VENDOR_BILL = 'VENDOR_BILL',
  VENDOR_CREDIT = 'VENDOR_CREDIT',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT',
  EXPENSE_REPORT = 'EXPENSE_REPORT',
  VENDOR_RETURN_AUTHORIZATION = 'VENDOR_RETURN_AUTHORIZATION',
  ITEM_RECEIPT = 'ITEM_RECEIPT',
  ITEM_FULFILLMENT = 'ITEM_FULFILLMENT',
  INVENTORY_ADJUSTMENT = 'INVENTORY_ADJUSTMENT',
  INVENTORY_TRANSFER = 'INVENTORY_TRANSFER',
  WORK_ORDER = 'WORK_ORDER',
  COLLECT = 'COLLECT',
  PAYMENT = 'PAYMENT',
}

export enum RiskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  CONTAINS = 'CONTAINS',
  VARIANCE_GT_PCT = 'VARIANCE_GT_PCT',
  AGE_GT_DAYS = 'AGE_GT_DAYS',
}

export enum RiskActionType {
  BLOCK = 'BLOCK',
  FLAG = 'FLAG',
  REQUIRE_SECOND_APPROVAL = 'REQUIRE_SECOND_APPROVAL',
  ROUTE_TO_ROLE = 'ROUTE_TO_ROLE',
  NOTIFY = 'NOTIFY',
}

export interface CreateRiskPolicyRequest {
  name: string;
  description: string;
  category: RiskCategory;
  transactionTypes: TransactionType[];
  severity: RiskSeverity;
  enabled: boolean;
  rules?: RiskRule[];
  actions?: RiskAction[];
  scope?: Record<string, any>;
  submissionRequirements?: Record<string, any>;
}

export interface UpdateRiskPolicyRequest
  extends Partial<CreateRiskPolicyRequest> {}

export interface RiskPolicyListResponse {
  data: RiskPolicy[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy: Array<[string, 'ASC' | 'DESC']>;
  };
  links: {
    current: string;
  };
}

export interface RiskPolicyFilters {
  page?: number;
  limit?: number;
  sortBy?: string[];
  search?: string;
  searchBy?: string[];
  category?: RiskCategory;
  severity?: RiskSeverity;
  enabled?: boolean;
  transactionType?: TransactionType;
}

// API Client
class RiskManagementApi {
  private baseURL = '/risk-management';

  // Create a new risk policy
  async createPolicy(data: CreateRiskPolicyRequest): Promise<RiskPolicy> {
    const response = await axios.post(`${this.baseURL}/policies`, data);
    return response.data;
  }

  // Get all risk policies with pagination and filtering
  async getPolicies(
    filters: RiskPolicyFilters = {}
  ): Promise<RiskPolicyListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) {
      filters.sortBy.forEach((sort) => params.append('sortBy', sort));
    }
    if (filters.search) params.append('search', filters.search);
    if (filters.searchBy) {
      filters.searchBy.forEach((field) => params.append('searchBy', field));
    }

    const response = await axios.get(
      `${this.baseURL}/policies?${params.toString()}`
    );
    return response.data;
  }

  // Get a specific risk policy by ID
  async getPolicy(id: string): Promise<RiskPolicy> {
    const response = await axios.get(`${this.baseURL}/policies/${id}`);
    return response.data;
  }

  // Update a risk policy
  async updatePolicy(
    id: string,
    data: UpdateRiskPolicyRequest
  ): Promise<RiskPolicy> {
    const response = await axios.patch(`${this.baseURL}/policies/${id}`, data);
    return response.data;
  }

  // Delete a risk policy
  async deletePolicy(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/policies/${id}`);
  }

  // Enable a risk policy
  async enablePolicy(id: string): Promise<RiskPolicy> {
    const response = await axios.patch(`${this.baseURL}/policies/${id}/enable`);
    return response.data;
  }

  // Disable a risk policy
  async disablePolicy(id: string): Promise<RiskPolicy> {
    const response = await axios.patch(
      `${this.baseURL}/policies/${id}/disable`
    );
    return response.data;
  }
}

export const riskManagementApi = new RiskManagementApi();

// Helper functions for field configuration
export const RISK_FIELD_CONFIGS = {
  'invoice.invoiceTotal': {
    label: 'Invoice Total',
    type: 'number',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.GREATER_THAN,
      RiskOperator.LESS_THAN,
      RiskOperator.GREATER_OR_EQUAL,
      RiskOperator.LESS_OR_EQUAL,
    ],
  },
  'invoice.discountRate': {
    label: 'Discount Rate',
    type: 'number',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.GREATER_THAN,
      RiskOperator.LESS_THAN,
      RiskOperator.GREATER_OR_EQUAL,
      RiskOperator.LESS_OR_EQUAL,
    ],
  },
  'invoice.taxRate': {
    label: 'Tax Rate',
    type: 'number',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.GREATER_THAN,
      RiskOperator.LESS_THAN,
    ],
  },
  'invoice.paymentTerms': {
    label: 'Payment Terms (Days)',
    type: 'number',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.GREATER_THAN,
      RiskOperator.LESS_THAN,
      RiskOperator.GREATER_OR_EQUAL,
      RiskOperator.LESS_OR_EQUAL,
    ],
  },
  'invoice.lineItemsCount': {
    label: 'Number of Line Items',
    type: 'number',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.GREATER_THAN,
      RiskOperator.LESS_THAN,
      RiskOperator.GREATER_OR_EQUAL,
      RiskOperator.LESS_OR_EQUAL,
    ],
  },
  'vendor.status': {
    label: 'Vendor Status',
    type: 'select',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.IN,
      RiskOperator.NOT_IN,
    ],
    options: ['ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED'],
  },
  'vendor.kycStatus': {
    label: 'Vendor KYC Status',
    type: 'select',
    operators: [RiskOperator.EQUALS, RiskOperator.NOT_EQUALS],
    options: ['VERIFIED', 'PENDING', 'REJECTED', 'NOT_REQUIRED'],
  },
  'payment.method': {
    label: 'Payment Method',
    type: 'select',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.IN,
      RiskOperator.NOT_IN,
    ],
    options: ['BANK_TRANSFER', 'MOBILE_MONEY', 'CASH', 'CARD', 'CHECK'],
  },
  'transaction.dayOfWeek': {
    label: 'Day of Week',
    type: 'select',
    operators: [
      RiskOperator.EQUALS,
      RiskOperator.NOT_EQUALS,
      RiskOperator.IN,
      RiskOperator.NOT_IN,
    ],
    options: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
  },
  'transaction.isWeekend': {
    label: 'Is Weekend',
    type: 'boolean',
    operators: [RiskOperator.EQUALS, RiskOperator.NOT_EQUALS],
  },
};

export const RISK_CATEGORY_LABELS = {
  [RiskCategory.INTERNAL]: 'Internal Risk',
  [RiskCategory.EXTERNAL]: 'External Risk',
  [RiskCategory.LIQUIDITY]: 'Liquidity Risk',
};

export const RISK_SEVERITY_LABELS = {
  [RiskSeverity.LOW]: 'Low',
  [RiskSeverity.MEDIUM]: 'Medium',
  [RiskSeverity.HIGH]: 'High',
  [RiskSeverity.CRITICAL]: 'Critical',
};

export const RISK_SEVERITY_COLORS = {
  [RiskSeverity.LOW]: 'bg-green-100 text-green-800',
  [RiskSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [RiskSeverity.HIGH]: 'bg-orange-100 text-orange-800',
  [RiskSeverity.CRITICAL]: 'bg-red-100 text-red-800',
};

export const TRANSACTION_TYPE_LABELS = {
  [TransactionType.SALES_ORDER]: 'Sales Order',
  [TransactionType.INVOICE]: 'Invoice',
  [TransactionType.CASH_SALE]: 'Cash Sale',
  [TransactionType.CREDIT_MEMO]: 'Credit Memo',
  [TransactionType.RETURN_AUTHORIZATION]: 'Return Authorization',
  [TransactionType.CUSTOMER_PAYMENT]: 'Customer Payment',
  [TransactionType.ESTIMATE_QUOTE]: 'Estimate Quote',
  [TransactionType.PURCHASE_ORDER]: 'Purchase Order',
  [TransactionType.VENDOR_BILL]: 'Vendor Bill',
  [TransactionType.VENDOR_CREDIT]: 'Vendor Credit',
  [TransactionType.VENDOR_PAYMENT]: 'Vendor Payment',
  [TransactionType.EXPENSE_REPORT]: 'Expense Report',
  [TransactionType.VENDOR_RETURN_AUTHORIZATION]: 'Vendor Return Authorization',
  [TransactionType.ITEM_RECEIPT]: 'Item Receipt',
  [TransactionType.ITEM_FULFILLMENT]: 'Item Fulfillment',
  [TransactionType.INVENTORY_ADJUSTMENT]: 'Inventory Adjustment',
  [TransactionType.INVENTORY_TRANSFER]: 'Inventory Transfer',
  [TransactionType.WORK_ORDER]: 'Work Order',
  [TransactionType.COLLECT]: 'Collect',
  [TransactionType.PAYMENT]: 'Payment',
};

export const RISK_OPERATOR_LABELS = {
  [RiskOperator.EQUALS]: 'Equals',
  [RiskOperator.NOT_EQUALS]: 'Not Equals',
  [RiskOperator.GREATER_THAN]: 'Greater Than',
  [RiskOperator.LESS_THAN]: 'Less Than',
  [RiskOperator.GREATER_OR_EQUAL]: 'Greater Or Equal',
  [RiskOperator.LESS_OR_EQUAL]: 'Less Or Equal',
  [RiskOperator.IN]: 'In',
  [RiskOperator.NOT_IN]: 'Not In',
  [RiskOperator.CONTAINS]: 'Contains',
  [RiskOperator.VARIANCE_GT_PCT]: 'Variance Greater Than %',
  [RiskOperator.AGE_GT_DAYS]: 'Age Greater Than Days',
};

export const RISK_ACTION_TYPE_LABELS = {
  [RiskActionType.BLOCK]: 'Block',
  [RiskActionType.FLAG]: 'Flag',
  [RiskActionType.REQUIRE_SECOND_APPROVAL]: 'Require Second Approval',
  [RiskActionType.ROUTE_TO_ROLE]: 'Route To Role',
  [RiskActionType.NOTIFY]: 'Notify',
};
