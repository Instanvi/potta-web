export enum FieldType {
  AMOUNT = 'amount',
  DEPARTMENT = 'department',
  LOCATION_BRANCH = 'location branch',
  MATCHED_TO_PURCHASE_ORDER = 'matched to purchase order',
  PAYMENT_TYPE = 'payment type',
  EXPENSE_CATEGORY = 'expense category',
  CUSTOMER = 'customer',
  INVENTORY_ITEM = 'inventory item',
  VENDOR = 'vendor',
}

export enum ApproverActionType {
  APPROVAL = 'require approval',
  NOTIFICATION = 'notify',
}

export enum ApprovalMode {
  ALL = 'all', 
  ANY = 'any',
}

// Add this new interface for entity references
export interface EntityReference {
  id: string;
  name: string;

  value?: string;
  label?: string;
}

// Update ConditionDetail to support EntityReference types
export interface ConditionDetail {
  id: string;
  field: FieldType | string;
  operator: string;
  // More specific typing for the value field
  value: 
    | string 
    | number 
    | boolean 
    | string[] 
    | EntityReference 
    | EntityReference[] 
    | (string | EntityReference)[] // Add support for mixed arrays
    | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string; // Optional profile picture URL
  initials?: string; // Optional initials for avatar fallback
}

export interface ConditionAction {
  id: string;
  type: ApproverActionType;
  mode: ApprovalMode;
  userIds: string[];  // Keep for backward compatibility
  users?: User[];     // Add new field for full user objects
}

export interface Requirements {
  requireReceipt: boolean;
  requireMemo: boolean;
  requireScreenshots: boolean;
  requireNetSuiteCustomerJob: boolean;
  requireGpsCoordinates: boolean;
  businessPurpose: boolean;
  requireBeforeAfterScreenshots: boolean;
  [key: string]: boolean; // Add index signature to allow string indexing
}

export interface ExtendedCondition {
  id: string;
  conditions: ConditionDetail[];
  actions: ConditionAction[];
  requirements?: Requirements; // Optional requirements property
}

export interface ExtendedApprovalRule {
  name: string;
  rules: ExtendedCondition[];
}

// Update SelectOption to align with EntityReference
export interface SelectOption extends EntityReference {
  // Any additional properties specific to SelectOption can go here
}

export enum Operator {
  IS = 'is',
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equal',
  LESS_THAN = 'less than',
  GREATER_THAN = 'greater_than',
  LESS_THAN_OR_EQUAL = 'less_than_equal',
  GREATER_THAN_OR_EQUAL = 'greater_than_equal',
  CONTAINS = 'contains',
  IS_ONE_OF = 'is_one_of',
  IS_NOT_ONE_OF = 'is_not_one_of',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IS_NOT = 'is not',
}

// Helper constant to identify entity fields
export const ENTITY_FIELDS: string[] = [
  FieldType.DEPARTMENT,
  FieldType.LOCATION_BRANCH,
  FieldType.PAYMENT_TYPE,
  FieldType.EXPENSE_CATEGORY,
  FieldType.CUSTOMER,
  FieldType.INVENTORY_ITEM,
  FieldType.VENDOR
];

// Field configuration for UI rendering and behavior
export interface FieldConfig {
  label: string;
  operators: Operator[];
  isEntity?: boolean;
  isMultiValue?: boolean;
}

// Field configuration map
export const FIELD_CONFIGS: Record<string, FieldConfig> = {
  [FieldType.AMOUNT]: {
    label: 'Amount',
    operators: [
      Operator.EQUALS,
      Operator.NOT_EQUALS,
      Operator.LESS_THAN,
      Operator.GREATER_THAN,
      Operator.LESS_THAN_OR_EQUAL,
      Operator.GREATER_THAN_OR_EQUAL
    ]
  },
  [FieldType.DEPARTMENT]: {
    label: 'Department',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  },
  [FieldType.LOCATION_BRANCH]: {
    label: 'Location/Branch',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  },
  [FieldType.MATCHED_TO_PURCHASE_ORDER]: {
    label: 'Matched to Purchase Order',
    operators: [Operator.EQUALS]
  },
  [FieldType.PAYMENT_TYPE]: {
    label: 'Payment Type',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  },
  [FieldType.EXPENSE_CATEGORY]: {
    label: 'Expense Category',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  },
  [FieldType.CUSTOMER]: {
    label: 'Customer',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  },
  [FieldType.INVENTORY_ITEM]: {
    label: 'Inventory Item',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  },
  [FieldType.VENDOR]: {
    label: 'Vendor',
    operators: [Operator.IS, Operator.IS_NOT, Operator.IS_ONE_OF, Operator.IS_NOT_ONE_OF],
    isEntity: true
  }
};
