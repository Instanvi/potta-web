// components/spend-policy/approval-rule-form/hooks/use-field-config.ts (continued)
import { useMemo } from 'react';
import { FieldConfig } from '../utils/approval-rule-utils';

export function useFieldConfig(transactionType: string) {
  // Available options based on the Spend Policy document
  const transactionFields = useMemo(() => {
    const baseFields = [
      { value: 'amount', label: 'Amount' },
      { value: 'businessEntity', label: 'Business Entity' },
      { value: 'department', label: 'Department' },
      { value: 'locationBranch', label: 'Location/Branch' },
      { value: 'paymentType', label: 'Payment Type' },
      { value: 'expenseCategory', label: 'Expense Category' },
      { value: 'customer', label: 'Customer' },
    ];

    // Add transaction-specific fields
    if (transactionType === 'bills') {
      baseFields.push(
        { value: 'matchedToPO', label: 'Matched to Purchase Order' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'dueDate', label: 'Due Date' },
        { value: 'invoiceNumber', label: 'Invoice Number' }
      );
    } else if (transactionType === 'expenses') {
      baseFields.push(
        { value: 'vendor', label: 'Vendor' },
        { value: 'receiptStatus', label: 'Receipt Status' }
      );
    } else if (transactionType === 'spendRequests') {
      baseFields.push(
        { value: 'vendor', label: 'Vendor' },
        { value: 'inventoryItem', label: 'Inventory Item' }
      );
    } else if (transactionType === 'vendors') {
      baseFields.push(
        { value: 'vendorType', label: 'Vendor Type' },
        { value: 'vendorRisk', label: 'Vendor Risk Level' }
      );
    }

    return baseFields;
  }, [transactionType]);

  // Define field configurations
  const fieldConfigs: Record<string, FieldConfig> = {
    amount: {
      type: 'numeric',
      operators: [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Does Not Equal' },
        { value: 'lessThan', label: 'Less Than' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
        { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
      ],
    },
    matchedToPO: {
      type: 'boolean',
      operators: [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
      ],
      valueOptions: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    receiptStatus: {
      type: 'boolean',
      operators: [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
      ],
      valueOptions: [
        { value: 'present', label: 'Present' },
        { value: 'missing', label: 'Missing' },
      ],
    },
    dueDate: {
      type: 'numeric',
      operators: [
        { value: 'lessThan', label: 'Less Than' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'equals', label: 'Equals' },
      ],
    },
    vendor: {
      type: 'multi-entity',
      operators: [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'isAnyOf', label: 'Is Any Of' },
        { value: 'isNoneOf', label: 'Is None Of' },
      ],
      multiSelect: true,
    },
    customer: {
      type: 'multi-entity',
      operators: [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'isAnyOf', label: 'Is Any Of' },
        { value: 'isNoneOf', label: 'Is None Of' },
      ],
      multiSelect: true,
    },
    // Default configuration for entity-based fields (departments, vendors, etc.)
    default: {
      type: 'entity',
      operators: [
        { value: 'is', label: 'Is' },
        { value: 'isNot', label: 'Is Not' },
        { value: 'contains', label: 'Contains' },
        { value: 'doesNotContain', label: 'Does Not Contain' },
      ],
    },
  };

  // Sample entity values for different fields
  const entityValues: Record<
    string,
    Array<{ value: string; label: string }>
  > = {
    businessEntity: [
      { value: 'entity-1', label: 'Main Business' },
      { value: 'entity-2', label: 'Subsidiary A' },
      { value: 'entity-3', label: 'Subsidiary B' },
    ],
    department: [
      { value: 'dept-1', label: 'Finance' },
      { value: 'dept-2', label: 'Marketing' },
      { value: 'dept-3', label: 'Operations' },
      { value: 'dept-4', label: 'IT' },
    ],
    locationBranch: [
      { value: 'loc-1', label: 'Headquarters' },
      { value: 'loc-2', label: 'West Branch' },
      { value: 'loc-3', label: 'East Branch' },
    ],
    paymentType: [
      { value: 'payment-1', label: 'Credit Card' },
      { value: 'payment-2', label: 'Wire Transfer' },
      { value: 'payment-3', label: 'Check' },
      { value: 'payment-4', label: 'Cash' },
      { value: 'payment-5', label: 'Reimbursement' },
      { value: 'payment-6', label: 'Bill Payment' },
      { value: 'payment-7', label: 'Mileage Reimbursement' },
    ],
    expenseCategory: [
      { value: 'exp-1', label: 'Travel' },
      { value: 'exp-2', label: 'Office Supplies' },
      { value: 'exp-3', label: 'Software' },
      { value: 'exp-4', label: 'Consulting' },
      { value: 'exp-5', label: 'Meals & Entertainment' },
    ],
    customer: [
      { value: 'cust-1', label: 'Acme Corp' },
      { value: 'cust-2', label: 'Globex' },
      { value: 'cust-3', label: 'Initech' },
    ],
    inventoryItem: [
      { value: 'item-1', label: 'Product A' },
      { value: 'item-2', label: 'Product B' },
      { value: 'item-3', label: 'Service C' },
    ],
    vendor: [
      { value: 'vendor-1', label: 'Bujeti Inc' },
      { value: 'vendor-2', label: 'Google Suite' },
      { value: 'vendor-3', label: 'Zoho Technologies Limited' },
      { value: 'vendor-4', label: 'Microsoft' },
      { value: 'vendor-5', label: 'Amazon Web Services' },
    ],
    vendorType: [
      { value: 'type-1', label: 'Software' },
      { value: 'type-2', label: 'Hardware' },
      { value: 'type-3', label: 'Services' },
      { value: 'type-4', label: 'Supplies' },
    ],
    vendorRisk: [
      { value: 'risk-1', label: 'Low' },
      { value: 'risk-2', label: 'Medium' },
      { value: 'risk-3', label: 'High' },
    ],
  };

  // Get field configuration for a specific field
  const getFieldConfig = (field: string): FieldConfig => {
    return fieldConfigs[field] || fieldConfigs.default;
  };

  // Get available operators for a field
  const getOperatorsForField = (field: string) => {
    return getFieldConfig(field).operators;
  };

  // Get available value options for a field/operator combination
  const getValueOptionsForField = (field: string, operator: string) => {
    const config = getFieldConfig(field);

    // If the field has predefined value options, use those
    if (config.valueOptions) {
      return config.valueOptions;
    }

    // For entity fields, use the entity values
    if (
      (config.type === 'entity' || config.type === 'multi-entity') &&
      entityValues[field]
    ) {
      return entityValues[field];
    }

    // For numeric fields, we'll use an input instead of a select
    if (config.type === 'numeric') {
      return [];
    }

    // Default empty options
    return [];
  };

  // Check if a field should use input instead of select for values
  const shouldUseInputForValue = (field: string) => {
    const config = getFieldConfig(field);
    return config.type === 'numeric';
  };

  // Check if a field should use multi-select for values
  const shouldUseMultiSelectForValue = (field: string, operator: string) => {
    const config = getFieldConfig(field);
    return (
      config.multiSelect && (operator === 'isAnyOf' || operator === 'isNoneOf')
    );
  };

  return {
    transactionFields,
    getFieldConfig,
    getOperatorsForField,
    getValueOptionsForField,
    shouldUseInputForValue,
    shouldUseMultiSelectForValue,
    entityValues,
  };
}
