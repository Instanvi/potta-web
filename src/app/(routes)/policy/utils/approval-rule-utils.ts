// utils/approval-rule-utils.ts
import { FieldType } from '../types/approval-rule';

// Available operators
export const AVAILABLE_OPERATORS = [
  { id: 'equals', name: 'Equals' },
  { id: 'not_equals', name: 'Not Equals' },
  { id: 'greater_than', name: 'Greater Than' },
  { id: 'less_than', name: 'Less Than' },
  { id: 'in', name: 'In' },
  { id: 'not_in', name: 'Not In' }
];

// Format field value for display
// Add or update the formatFieldValue function
export const formatFieldValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return String(value);
};

// Get field name for display
export const getFieldDisplayName = (field: string): string => {
  const fieldType = field as FieldType;
  switch (fieldType) {
    case FieldType.AMOUNT:
      return 'Amount';
    case FieldType.DEPARTMENT:
      return 'Department';
    case FieldType.LOCATION_BRANCH:
      return 'Location/Branch';
    case FieldType.MATCHED_TO_PURCHASE_ORDER:
      return 'Matched to Purchase Order';
    case FieldType.PAYMENT_TYPE:
      return 'Payment Type';
    case FieldType.EXPENSE_CATEGORY:
      return 'Expense Category';
    case FieldType.CUSTOMER:
      return 'Customer';
    case FieldType.INVENTORY_ITEM:
      return 'Inventory Item';
    case FieldType.VENDOR:
      return 'Vendor';
    default:
      return field;
  }
};

// Generate unique ID
export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
