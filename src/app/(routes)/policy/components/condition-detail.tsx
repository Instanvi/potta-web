import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@potta/components/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Input } from '@potta/components/shadcn/input';
import { CustomerSelect } from './customer-select';
import { VendorSelect } from './vendor-select';
import { InventoryItemSelect } from './inventory-item-select';
import { ConditionDetail, FieldType, Operator } from '../types/approval-rule';

interface ConditionDetailComponentProps {
  detail: ConditionDetail;
  canRemove: boolean;
  onUpdate: (field: keyof ConditionDetail, value: any) => void;
  onRemove: () => void;
}

// Define types for customer value to avoid 'never' type issues
type CustomerObject = { name: string; uuid: string };
type CustomerValue = CustomerObject | CustomerObject[] | null;

// Define types for vendor value
type VendorObject = { name: string; id: string };
type VendorValue = VendorObject | VendorObject[] | null;

// Define types for inventory item value
type InventoryItemObject = { name: string; id: string };
type InventoryItemValue = InventoryItemObject | InventoryItemObject[] | null;

export const ConditionDetailComponent: React.FC<
  ConditionDetailComponentProps
> = ({ detail, canRemove, onUpdate, onRemove }) => {
  // Local state to track the selected field and operator
  const [selectedField, setSelectedField] = useState<string>(
    detail.field || ''
  );
  const [selectedOperator, setSelectedOperator] = useState<string>(
    detail.operator || ''
  );

  // Determine if we should use multi-select based on the operator
  const isMultiSelect = useMemo(() => {
    return [
      Operator.CONTAINS,
      Operator.IS_ONE_OF,
      Operator.IS_NOT_ONE_OF,
    ].includes(selectedOperator as Operator);
  }, [selectedOperator]);

  // Update local state when props change, but only if they're different
  useEffect(() => {
    if (detail.field !== selectedField && detail.field) {
      setSelectedField(detail.field);
    }
    if (detail.operator !== selectedOperator && detail.operator) {
      setSelectedOperator(detail.operator);
    }
  }, [detail.field, detail.operator]);

  // Get the display name for the field
  const getFieldDisplayName = (field: string): string => {
    switch (field) {
      case FieldType.AMOUNT:
        return 'Amount';
      case FieldType.CUSTOMER:
        return 'Customer';
      case FieldType.VENDOR:
        return 'Vendor';
      case FieldType.INVENTORY_ITEM:
        return 'Inventory Item';
      case FieldType.EXPENSE_CATEGORY:
        return 'Category';
      case FieldType.DEPARTMENT:
        return 'Department';
      default:
        return field;
    }
  };

  // Get valid operators based on the field type
  const validOperators = useMemo(() => {
    switch (selectedField) {
      case FieldType.AMOUNT:
        return [
          Operator.LESS_THAN,
          Operator.LESS_THAN_OR_EQUAL,
          Operator.GREATER_THAN,
          Operator.GREATER_THAN_OR_EQUAL,
          Operator.EQUALS,
          Operator.NOT_EQUALS,
        ];
      case FieldType.CUSTOMER:
        return [
          Operator.CONTAINS,
          Operator.IS_ONE_OF,
          Operator.IS_NOT_ONE_OF,
          Operator.IS,
          Operator.IS_NOT,
        ];
      case FieldType.VENDOR:
        return [
          Operator.CONTAINS,
          Operator.IS_ONE_OF,
          Operator.IS_NOT_ONE_OF,
          Operator.IS,
          Operator.IS_NOT,
        ];
      case FieldType.INVENTORY_ITEM:
        return [
          Operator.CONTAINS,
          Operator.IS_ONE_OF,
          Operator.IS_NOT_ONE_OF,
          Operator.IS,
          Operator.IS_NOT,
        ];
      case FieldType.EXPENSE_CATEGORY:
      case FieldType.PAYMENT_TYPE:
        return [
          Operator.CONTAINS,
          Operator.IS_ONE_OF,
          Operator.IS_NOT_ONE_OF,
          Operator.IS,
          Operator.IS_NOT,
        ];
      case FieldType.DEPARTMENT:
        return [
          Operator.EQUALS,
          Operator.NOT_EQUALS,
          Operator.IS_ONE_OF,
          Operator.IS_NOT_ONE_OF,
        ];
      default:
        return [Operator.EQUALS, Operator.NOT_EQUALS];
    }
  }, [selectedField]);

  // Helper function to convert any value to a CustomerObject
  const toCustomerObject = (value: any): CustomerObject => {
    if (typeof value === 'string') {
      return { name: '', uuid: value };
    } else if (value && typeof value === 'object') {
      return {
        name: value.name || '',
        uuid: value.uuid || value.id || '',
      };
    }
    return { name: '', uuid: '' };
  };

  // Helper function to convert any value to a VendorObject
  const toVendorObject = (value: any): VendorObject => {
    if (typeof value === 'string') {
      return { name: '', id: value };
    } else if (value && typeof value === 'object') {
      return {
        name: value.name || '',
        id: value.id || value.uuid || '',
      };
    }
    return { name: '', id: '' };
  };

  // Helper function to convert any value to an InventoryItemObject
  const toInventoryItemObject = (value: any): InventoryItemObject => {
    if (typeof value === 'string') {
      return { name: '', id: value };
    } else if (value && typeof value === 'object') {
      return {
        name: value.name || '',
        id: value.id || value.uuid || '',
      };
    }
    return { name: '', id: '' };
  };

  // Handle field change and reset operator and value
  const handleFieldChange = (fieldValue: string) => {
    console.log('Field selected:', fieldValue);

    // Update local state
    setSelectedField(fieldValue);

    // Update parent component state
    onUpdate('field', fieldValue);


    //DO NOT UNCOMMENT
    // // Reset operator when field changes
    // setSelectedOperator('');
    // onUpdate('operator', '');

    // // Initialize value based on field type
    // if ([FieldType.CUSTOMER, FieldType.VENDOR, FieldType.INVENTORY_ITEM].includes(fieldValue as FieldType)) {
    //   onUpdate('field', fieldValue);
    //   onUpdate('value', isMultiSelect ? [] : '');
    // } else {
    //   onUpdate('field', fieldValue);
    //   onUpdate('value', isMultiSelect ? [] : '');
    // }

  };

  // Handle operator change with proper multi-select handling
  const handleOperatorChange = (operatorValue: string) => {
    console.log('Operator selected:', operatorValue);

    // Update local state
    setSelectedOperator(operatorValue);

    // Update parent component state
    onUpdate('operator', operatorValue);

    // Check if multi-select status is changing
    const newIsMultiSelect = [
      Operator.CONTAINS,
      Operator.IS_ONE_OF,
      Operator.IS_NOT_ONE_OF,
    ].includes(operatorValue as Operator);

    if (newIsMultiSelect !== isMultiSelect) {
      // Convert value format based on multi-select change
      if (selectedField === FieldType.CUSTOMER) {
        if (newIsMultiSelect) {
          // Convert single value to array for multi-select
          if (detail.value && !Array.isArray(detail.value)) {
            onUpdate('value', [toCustomerObject(detail.value)]);
          } else {
            onUpdate('value', []);
          }
        } else {
          // Convert array to single value for single-select
          if (Array.isArray(detail.value) && detail.value.length > 0) {
            onUpdate('value', toCustomerObject(detail.value[0]));
          } else {
            onUpdate('value', null);
          }
        }
      } else if (selectedField === FieldType.VENDOR) {
        if (newIsMultiSelect) {
          // Convert single value to array for multi-select
          if (detail.value && !Array.isArray(detail.value)) {
            onUpdate('value', [toVendorObject(detail.value)]);
          } else {
            onUpdate('value', []);
          }
        } else {
          // Convert array to single value for single-select
          if (Array.isArray(detail.value) && detail.value.length > 0) {
            onUpdate('value', toVendorObject(detail.value[0]));
          } else {
            onUpdate('value', null);
          }
        }
      } else if (selectedField === FieldType.INVENTORY_ITEM) {
        if (newIsMultiSelect) {
          // Convert single value to array for multi-select
          if (detail.value && !Array.isArray(detail.value)) {
            onUpdate('value', [toInventoryItemObject(detail.value)]);
          } else {
            onUpdate('value', []);
          }
        } else {
          // Convert array to single value for single-select
          if (Array.isArray(detail.value) && detail.value.length > 0) {
            onUpdate('value', toInventoryItemObject(detail.value[0]));
          } else {
            onUpdate('value', null);
          }
        }
      } else {
        // For other field types
        if (newIsMultiSelect) {
          // Convert single value to array
          if (
            detail.value !== null &&
            detail.value !== undefined &&
            detail.value !== ''
          ) {
            onUpdate('value', [String(detail.value)]);
          } else {
            onUpdate('value', []);
          }
        } else {
          // Convert array to single value
          if (Array.isArray(detail.value) && detail.value.length > 0) {
            onUpdate('value', String(detail.value[0]));
          } else {
            onUpdate('value', '');
          }
        }
      }
    }
  };

  // Handle value update with type conversion for numerical fields
  const handleValueUpdate = (value: any) => {
    if (selectedField === FieldType.AMOUNT && !isMultiSelect) {
      // Convert to number for amount fields
      const numValue = parseFloat(value);
      onUpdate('value', isNaN(numValue) ? '' : numValue);
    } else {
      console.log('Value updated:', value);
      onUpdate('value', value);
    }
  };

  // Render the appropriate input based on field type and operator
  const renderValueInput = () => {
    // If no field or operator is selected, return empty input
    if (!selectedField || !selectedOperator) {
      return <Input disabled placeholder="Select field and operator first" />;
    }

    // For amount field, render a number input
    if (selectedField === FieldType.AMOUNT) {
      return (
        <Input
          type="number"
          step="0.01"
          placeholder="Enter amount"
          value={typeof detail.value === 'number' ? detail.value : ''}
          onChange={(e) => handleValueUpdate(e.target.value)}
        />
      );
    }

    // For customer field, render CustomerSelect with object format
    if (selectedField === FieldType.CUSTOMER) {
      let customerValue: CustomerValue;

      if (isMultiSelect) {
        // Multi-select mode - ensure we have an array of customer objects
        if (Array.isArray(detail.value)) {
          customerValue = detail.value.map(toCustomerObject);
        } else if (detail.value !== null && detail.value !== undefined) {
          // If we have a single value but need an array
          customerValue = [toCustomerObject(detail.value)];
        } else {
          customerValue = [];
        }
      } else {
        // Single-select mode - ensure we have a single customer object or null
        if (Array.isArray(detail.value) && detail.value.length > 0) {
          customerValue = toCustomerObject(detail.value[0]);
        } else if (detail.value !== null && detail.value !== undefined) {
          customerValue = toCustomerObject(detail.value);
        } else {
          customerValue = null;
        }
      }

      return (
        <CustomerSelect
          value={customerValue}
          onChange={handleValueUpdate}
          isMultiSelect={isMultiSelect}
          placeholder={isMultiSelect ? 'Select customers' : 'Select customer'}
        />
      );
    }

    // For vendor field, render VendorSelect with object format
    if (selectedField === FieldType.VENDOR) {
      let vendorValue: VendorValue;

      if (isMultiSelect) {
        // Multi-select mode - ensure we have an array of vendor objects
        if (Array.isArray(detail.value)) {
          vendorValue = detail.value.map(toVendorObject);
        } else if (detail.value !== null && detail.value !== undefined) {
          // If we have a single value but need an array
          vendorValue = [toVendorObject(detail.value)];
        } else {
          vendorValue = [];
        }
      } else {
        // Single-select mode - ensure we have a single vendor object or null
        if (Array.isArray(detail.value) && detail.value.length > 0) {
          vendorValue = toVendorObject(detail.value[0]);
        } else if (detail.value !== null && detail.value !== undefined) {
          vendorValue = toVendorObject(detail.value);
        } else {
          vendorValue = null;
        }
      }

      return (
        <VendorSelect
          value={vendorValue}
          onChange={handleValueUpdate}
          isMultiSelect={isMultiSelect}
          placeholder={isMultiSelect ? 'Select vendors' : 'Select vendor'}
        />
      );
    }

    // For inventory item field, render InventoryItemSelect with object format
    if (selectedField === FieldType.INVENTORY_ITEM) {
      let itemValue: InventoryItemValue;

      if (isMultiSelect) {
        // Multi-select mode - ensure we have an array of item objects
        if (Array.isArray(detail.value)) {
          itemValue = detail.value.map(toInventoryItemObject);
        } else if (detail.value !== null && detail.value !== undefined) {
          // If we have a single value but need an array
          itemValue = [toInventoryItemObject(detail.value)];
        } else {
          itemValue = [];
        }
      } else {
        // Single-select mode - ensure we have a single item object or null
        if (Array.isArray(detail.value) && detail.value.length > 0) {
          itemValue = toInventoryItemObject(detail.value[0]);
        } else if (detail.value !== null && detail.value !== undefined) {
          itemValue = toInventoryItemObject(detail.value);
        } else {
          itemValue = null;
        }
      }

      return (
        <InventoryItemSelect
          value={itemValue}
          onChange={handleValueUpdate}
          isMultiSelect={isMultiSelect}
          placeholder={isMultiSelect ? 'Select inventory items' : 'Select inventory item'}
        />
      );
    }

    // For category and department fields, render a simple text input
    return (
      <Input
        placeholder={`Enter ${selectedField.toLowerCase()}`}
        value={
          typeof detail.value === 'string'
            ? detail.value
            : typeof detail.value === 'number'
            ? String(detail.value)
            : Array.isArray(detail.value)
            ? detail.value.join(', ')
            : detail.value === true
            ? 'true'
            : detail.value === false
            ? 'false'
            : ''
        }
        onChange={(e) => handleValueUpdate(e.target.value)}
      />
    );
  };

  return (
    <div className="border rounded-md p-3 space-y-2">
      {/* Header with condition detail title and remove button */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Condition Detail</span>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Field, operator and value inputs */}
      <div className="grid grid-cols-3 gap-2">
        <Select value={selectedField} onValueChange={handleFieldChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(FieldType).map((field) => (
              <SelectItem key={field} value={field}>
                {getFieldDisplayName(field)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedOperator}
          onValueChange={handleOperatorChange}
          disabled={!selectedField}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {validOperators.map((operator) => (
              <SelectItem key={operator} value={operator}>
                {operator.charAt(0).toUpperCase() +
                  operator.slice(1).replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {renderValueInput()}
      </div>
    </div>
  );
};
