'use client';

// components/spend-policy/components/approval-rule-form.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@potta/components/shadcn/button';
import { Input } from '@potta/components/shadcn/input';
import { Label } from '@potta/components/shadcn/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@potta/components/shadcn/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Check, X, PlusCircle } from 'lucide-react';
import { Badge } from '@potta/components/shadcn/badge';
import { ScrollArea } from '@potta/components/shadcn/scroll-area';
import * as Yup from 'yup';

import {
  ExtendedApprovalRule,
  ExtendedCondition,
  User,
  FieldType,
} from './types/approval-rule';
import { generateId } from './utils/approval-rule-utils';
import { ConditionCard } from './components/condition-card';
import { useSearchEmployees } from './hooks/policyHooks';
import { RuleSummaryView } from './components/rule-summary-view';

// Interface for entities with name and ID
export interface EntityWithName {
  id: string;
  name: string;
}

interface ApprovalRuleFormProps {
  initialData?: ExtendedApprovalRule;
  onSubmit: (data: ExtendedApprovalRule) => void;
  onCancel: () => void;
  users?: User[];
}

// Define validation schema for the form
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Rule name must be at least 2 characters')
    .required('Rule name is required'),
  rules: Yup.array()
    .of(
      Yup.object({
        conditions: Yup.array().test(
          'unique-fields',
          'Fields must be unique within a rule',
          function (conditions) {
            if (!conditions || conditions.length <= 1) return true;

            // Filter out empty fields
            const fields = conditions
              .map((condition) => condition.field)
              .filter((field) => field !== '');

            // Check for duplicates
            const uniqueFields = new Set(fields);
            return fields.length === uniqueFields.size;
          }
        ),
      })
    )
    .required('At least one rule is required'),
});

export function ApprovalRuleForm({
  initialData,
  onSubmit,
  onCancel,
  users = [],
}: ApprovalRuleFormProps) {
  // Initialize with default values or provided initialData
  const [formData, setFormData] = useState<ExtendedApprovalRule>({
    name: initialData?.name || '',
    rules: initialData?.rules ||
      initialData?.rules || [
        {
          id: generateId('c'),
          conditions: [
            {
              id: generateId('cd'),
              field: '',
              operator: '',
              value: '',
            },
          ],
          actions: [],
          // Requirements object
          requirements: {
            requireReceipt: false,
            requireMemo: false,
            requireScreenshots: false,
            requireNetSuiteCustomerJob: false,
            requireGpsCoordinates: false,
            businessPurpose: false,
            requireBeforeAfterScreenshots: false,
          },
        },
      ],
  });

  // State for summary data
  const [summaryData, setSummaryData] = useState<ExtendedApprovalRule | null>(
    null
  );

  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    rules?: string | { [ruleId: string]: string };
  }>({});

  // State for entity lists used by both the form and the summary
  const [entityLists, setEntityLists] = useState<{
    vendors: EntityWithName[];
    customers: EntityWithName[];
    inventoryItems: EntityWithName[];
  }>({
    vendors: [],
    customers: [],
    inventoryItems: [],
  });

  // State for employee search
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');

  // Use the hook to fetch employees
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useSearchEmployees(employeeSearchQuery);

  // Transform the employee data to match the User interface
  const mappedUsers = React.useMemo(() => {
    if (!employeesData || !Array.isArray(employeesData)) return users; // Check if it's actually an array

    return employeesData.map((employee) => {
      // Extract first name and last name
      const firstName = employee.firstName || '';
      const lastName = employee.lastName || '';

      // Generate initials if needed (for avatar fallback)
      const initials = firstName.charAt(0) + lastName.charAt(0);

      return {
        id: employee.uuid,
        name: `${firstName} ${lastName}`,
        email: '', // No email provided in the data
        profilePicture: employee.profilePicture || '',
        initials: initials.toUpperCase(), // Store initials in uppercase
      };
    });
  }, [employeesData, users]);

  // Helper function to find user by ID
  const findUserById = (userId: string): string => {
    const user = mappedUsers.find((u) => u.id === userId);
    return user ? user.name : userId;
  };

  // Helper function to find entity name from a list of entities
  const findEntityName = (
    entities: EntityWithName[],
    entityId: string
  ): string => {
    if (!entityId) return '';

    const entity = entities.find((e) => e.id === entityId);
    return entity ? entity.name : `Entity ${entityId.substring(0, 8)}`;
  };

  // Extract entity collections from form data
  const extractEntityLists = () => {
    const vendors: EntityWithName[] = [];
    const customers: EntityWithName[] = [];
    const inventoryItems: EntityWithName[] = [];

    // Helper to add entity to the appropriate list if not already present
    const addEntity = (list: EntityWithName[], entity: EntityWithName) => {
      if (!list.some((e) => e.id === entity.id)) {
        list.push(entity);
      }
    };

    // Go through all conditions and extract entities
    formData.rules.forEach((rule) => {
      rule.conditions.forEach((condition) => {
        if (condition.field === FieldType.VENDOR && condition.value) {
          if (Array.isArray(condition.value)) {
            condition.value.forEach((v: any) => {
              if (v && typeof v === 'object' && 'id' in v && 'name' in v) {
                addEntity(vendors, { id: v.id, name: v.name });
              } else if (typeof v === 'string') {
                addEntity(vendors, { id: v, name: v });
              }
            });
          } else if (
            condition.value &&
            typeof condition.value === 'object' &&
            'id' in condition.value &&
            'name' in condition.value
          ) {
            // Add type assertion here
            addEntity(vendors, {
              id: (condition.value as any).id,
              name: (condition.value as any).name,
            });
          } else if (typeof condition.value === 'string') {
            addEntity(vendors, { id: condition.value, name: condition.value });
          }
        }

        if (condition.field === FieldType.CUSTOMER && condition.value) {
          if (Array.isArray(condition.value)) {
            condition.value.forEach((c: any) => {
              if (c && typeof c === 'object' && 'id' in c && 'name' in c) {
                addEntity(customers, { id: c.id, name: c.name });
              } else if (typeof c === 'string') {
                addEntity(customers, { id: c, name: c });
              }
            });
          } else if (
            condition.value &&
            typeof condition.value === 'object' &&
            'id' in condition.value &&
            'name' in condition.value
          ) {
            // Add type assertion here
            addEntity(customers, {
              id: (condition.value as any).id,
              name: (condition.value as any).name,
            });
          } else if (typeof condition.value === 'string') {
            addEntity(customers, {
              id: condition.value,
              name: condition.value,
            });
          }
        }

        if (condition.field === FieldType.INVENTORY_ITEM && condition.value) {
          if (Array.isArray(condition.value)) {
            condition.value.forEach((i: any) => {
              if (i && typeof i === 'object' && 'id' in i && 'name' in i) {
                addEntity(inventoryItems, { id: i.id, name: i.name });
              } else if (typeof i === 'string') {
                addEntity(inventoryItems, { id: i, name: i });
              }
            });
          } else if (
            condition.value &&
            typeof condition.value === 'object' &&
            'id' in condition.value &&
            'name' in condition.value
          ) {
            // Add type assertion here
            addEntity(inventoryItems, {
              id: (condition.value as any).id,
              name: (condition.value as any).name,
            });
          } else if (typeof condition.value === 'string') {
            addEntity(inventoryItems, {
              id: condition.value,
              name: condition.value,
            });
          }
        }
      });
    });

    return { vendors, customers, inventoryItems };
  };

  // Function to prepare summary-friendly data with display names
  const prepareSummaryData = (
    data: ExtendedApprovalRule
  ): ExtendedApprovalRule => {
    // Create a deep copy to avoid modifying the original
    const summaryData = JSON.parse(
      JSON.stringify(data)
    ) as ExtendedApprovalRule;

    // Process each rule
    summaryData.rules = summaryData.rules.map((rule) => {
      // Process conditions
      rule.conditions = rule.conditions.map((condition) => {
        const newCondition = { ...condition };

        // Replace IDs with display names based on field type
        switch (newCondition.field) {
          case FieldType.VENDOR:
            if (Array.isArray(newCondition.value)) {
              newCondition.value = (newCondition.value as any[]).map(
                (v: any) => {
                  if (v && typeof v === 'object' && 'id' in v) {
                    return v.name;
                  }
                  return findEntityName(entityLists.vendors, String(v));
                }
              );
            } else if (
              typeof newCondition.value === 'object' &&
              newCondition.value &&
              'id' in newCondition.value
            ) {
              newCondition.value = (newCondition.value as EntityWithName).name;
            } else {
              newCondition.value = findEntityName(
                entityLists.vendors,
                String(newCondition.value)
              );
            }
            break;

          case FieldType.CUSTOMER:
            if (Array.isArray(newCondition.value)) {
              newCondition.value = (newCondition.value as any[]).map(
                (v: any) => {
                  if (v && typeof v === 'object' && 'id' in v) {
                    return v.name;
                  }
                  return findEntityName(entityLists.customers, String(v));
                }
              );
            } else if (
              typeof newCondition.value === 'object' &&
              newCondition.value &&
              'id' in newCondition.value
            ) {
              newCondition.value = (newCondition.value as EntityWithName).name;
            } else {
              newCondition.value = findEntityName(
                entityLists.customers,
                String(newCondition.value)
              );
            }
            break;

          case FieldType.INVENTORY_ITEM:
            if (Array.isArray(newCondition.value)) {
              newCondition.value = (newCondition.value as any[]).map(
                (v: any) => {
                  if (v && typeof v === 'object' && 'id' in v) {
                    return v.name;
                  }
                  return findEntityName(entityLists.inventoryItems, String(v));
                }
              );
            } else if (
              typeof newCondition.value === 'object' &&
              newCondition.value &&
              'id' in newCondition.value
            ) {
              newCondition.value = (newCondition.value as EntityWithName).name;
            } else {
              newCondition.value = findEntityName(
                entityLists.inventoryItems,
                String(newCondition.value)
              );
            }
            break;

          case FieldType.PAYMENT_TYPE:
            if (Array.isArray(newCondition.value)) {
              newCondition.value = (newCondition.value as any[]).map((v: any) =>
                typeof v === 'string'
                  ? v.charAt(0).toUpperCase() + v.slice(1)
                  : String(v)
              );
            } else if (typeof newCondition.value === 'string') {
              newCondition.value =
                newCondition.value.charAt(0).toUpperCase() +
                newCondition.value.slice(1);
            }
            break;

          case FieldType.MATCHED_TO_PURCHASE_ORDER:
            newCondition.value = newCondition.value === 'true' ? 'Yes' : 'No';
            break;
        }

        return newCondition;
      });

      // Process actions - show user names instead of IDs
      rule.actions = rule.actions.map((action) => ({
        ...action,
        userIds: action.userIds.map((userId: string) => findUserById(userId)),
      }));

      return rule;
    });

    return summaryData;
  };

  console.log('Data passed to RuleSummaryView:', summaryData || formData);
  // Update summary data whenever formData changes
  useEffect(() => {
    // Extract entity lists from the current form data
    const extractedLists = extractEntityLists();
    setEntityLists(extractedLists);

    // Create the summary data with display names
    const newSummaryData = prepareSummaryData(formData);
    setSummaryData(newSummaryData);
  }, [formData, mappedUsers]);

  // Add a new rule
  const addRule = () => {
    setFormData({
      ...formData,
      rules: [
        ...formData.rules,
        {
          id: generateId('c'),
          conditions: [
            {
              id: generateId('cd'),
              field: '',
              operator: '',
              value: '',
            },
          ],
          actions: [],
          requirements: {
            requireReceipt: false,
            requireMemo: false,
            requireScreenshots: false,
            requireNetSuiteCustomerJob: false,
            requireGpsCoordinates: false,
            businessPurpose: false,
            requireBeforeAfterScreenshots: false,
          },
        },
      ],
    });
  };

  // Remove a rule
  const removeRule = (ruleId: string) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((rule) => rule.id !== ruleId),
    });

    // Clear validation error for this rule
    if (typeof validationErrors.rules === 'object') {
      const newErrors = { ...validationErrors };
      delete (newErrors.rules as any)[ruleId];
      setValidationErrors(newErrors);
    }
  };

  // Update a rule
  const updateRule = (updatedRule: ExtendedCondition) => {
    const newRules = formData.rules.map((rule) =>
      rule.id === updatedRule.id ? updatedRule : rule
    );

    setFormData({
      ...formData,
      rules: newRules,
    });
    console.log('Updated rules:', newRules);
    // Validate the updated rule for field uniqueness
    validateRuleFields(updatedRule);
  };

  // Validate that fields in a rule are unique
  const validateRuleFields = (rule: ExtendedCondition) => {
    // Skip validation if there's only one condition
    if (rule.conditions.length <= 1) {
      // Clear any existing error
      if (typeof validationErrors.rules === 'object') {
        const newErrors = { ...validationErrors };
        delete (newErrors.rules as any)[rule.id];
        setValidationErrors(newErrors);
      }
      return;
    }

    // Get non-empty fields
    const fields = rule.conditions
      .map((condition) => condition.field)
      .filter((field) => field !== '');

    // Check for duplicates
    const uniqueFields = new Set(fields);
    const hasDuplicates = fields.length !== uniqueFields.size;

    // Update validation errors
    if (hasDuplicates) {
      setValidationErrors((prev) => ({
        ...prev,
        rules: {
          ...(typeof prev.rules === 'object' ? prev.rules : {}),
          [rule.id]: 'Fields must be unique within a rule',
        },
      }));
    } else {
      // Clear error if no duplicates
      if (typeof validationErrors.rules === 'object') {
        const newErrors = { ...validationErrors };
        delete (newErrors.rules as any)[rule.id];
        setValidationErrors(newErrors);
      }
    }
  };

  // Validate rule name
  const validateName = (name: string) => {
    if (!name || name.length < 2) {
      setValidationErrors((prev) => ({
        ...prev,
        name: 'Rule name must be at least 2 characters',
      }));
    } else {
      // Clear error
      const newErrors = { ...validationErrors };
      delete newErrors.name;
      setValidationErrors(newErrors);
    }
  };

  // Handle name change with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData({ ...formData, name: newName });
    validateName(newName);
  };

  // Handle employee search query change
  const handleEmployeeSearch = (query: string) => {
    setEmployeeSearchQuery(query);
  };

  // Validate the entire form before submission
  const validateForm = async (): Promise<boolean> => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: { [key: string]: string } = {};

        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });

        setValidationErrors(errors);
      }
      return false;
    }
  };

  // Prepare the final data for submission - extract just the IDs for backend
  const prepareFormDataForSubmit = (data: ExtendedApprovalRule): any => {
    // Start with the basic structure
    const formattedData = {
      name: data.name,
      rules: data.rules.map((rule) => {
        // For each rule, create a cleaned version without IDs
        const cleanedRule = {
          conditions: rule.conditions.map((condition) => {
            // Extract IDs from entity values for backend
            let value = condition.value;

            // For fields that use entities, extract just the ID
            if (
              [
                FieldType.VENDOR,
                FieldType.CUSTOMER,
                FieldType.INVENTORY_ITEM,
              ].includes(condition.field as FieldType)
            ) {
              // Handle array of objects or strings
              if (Array.isArray(value)) {
                value = (value as any[]).map((v: any) => {
                  if (v && typeof v === 'object' && 'id' in v) {
                    return v.id;
                  }
                  return v;
                });
              }
              // Handle single object
              else if (value && typeof value === 'object' && 'id' in value) {
                value = (value as any).id;
              }
            }

            // For each condition, create a cleaned version without internal ID
            return {
              field: condition.field,
              operator: condition.operator,
              value: value,
            };
          }),
          actions: rule.actions.map((action) => {
            // For each action, create a cleaned version with renamed properties
            return {
              actionType: action.type,
              approvalMode: action.mode,
              selectedUserIds: action.userIds,
              approverType: 'user',
            };
          }),
          requirements: rule.requirements,
        };

        return cleanedRule;
      }),
    };

    console.log('Submitting data:', formattedData);
    return formattedData;
  };

  // Update the handleSubmit function to clean up the data before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (isValid && isFormValid()) {
      // Clean up the data structure before submission
      const cleanedData = prepareFormDataForSubmit(formData);
      onSubmit(cleanedData);
      onCancel(); // Close the modal after successful submission
    }
  };

  // Check if individual fields are valid
  const isFormValid = () => {
    // Check if there are any REAL validation errors (ignoring empty objects)
    const hasValidationErrors = Object.keys(validationErrors).some((key) => {
      if (
        key === 'rules' &&
        typeof validationErrors.rules === 'object' &&
        Object.keys(validationErrors.rules).length === 0
      ) {
        // Empty rules object - not a real error
        return false;
      }
      // Any other validation error is a real error
      return true;
    });

    if (hasValidationErrors) {
      console.log('Validation errors exist:', validationErrors);
      return false;
    }

    // Check each rule separately
    let allValid = true;
    formData.rules.forEach((rule, index) => {
      // Check conditions in each rule
      const conditionsValid = rule.conditions.every(
        (condition) =>
          condition.field !== '' &&
          condition.operator !== '' &&
          (condition.value !== '' ||
            (Array.isArray(condition.value) && condition.value.length > 0))
      );

      // Check actions in each rule
      const hasActions = rule.actions.length > 0;

      // Check that every action has users assigned
      const actionsHaveUsers =
        hasActions && rule.actions.every((action) => action.userIds.length > 0);

      if (!conditionsValid) {
        console.log(`Rule ${index} conditions not valid`, rule.conditions);
        allValid = false;
      }

      if (!hasActions) {
        console.log(`Rule ${index} has no actions`);
        allValid = false;
      }

      if (hasActions && !actionsHaveUsers) {
        console.log(`Rule ${index} has actions with no users assigned`);
        allValid = false;
      }
    });

    const nameValid = formData.name.trim() !== '' && formData.name.length >= 2;
    if (!nameValid) {
      console.log('Rule name not valid');
      allValid = false;
    }

    console.log('Form validity:', allValid);
    return allValid;
  };

  return (
    <div className="grid grid-cols-1 overflow-hidden lg:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Your existing form code */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Enter rule name"
              className={validationErrors.name ? 'border-red-500' : ''}
              required
            />
            {validationErrors.name && (
              <p className="text-sm text-red-500 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Rules & Actions</Label>
            </div>

            {formData.rules.map((rule, index) => (
              <div key={rule.id}>
                <ConditionCard
                  condition={rule}
                  index={index}
                  users={mappedUsers}
                  canRemove={formData.rules.length > 1}
                  onRemove={() => removeRule(rule.id)}
                  onUpdate={updateRule}
                />
                {typeof validationErrors.rules === 'object' &&
                  (validationErrors.rules as any)[rule.id] && (
                    <p className="text-sm text-red-500 mt-1">
                      {(validationErrors.rules as any)[rule.id]}
                    </p>
                  )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRule}
              className="flex items-center mt-4"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid()}>
            Save Rule
          </Button>
        </div>
      </form>

      {/* Rule Summary View - now passing the summary data */}
      <div className="lg:block h-[calc(100vh-200px)] overflow-y-auto">
        <div className="sticky top-0 bg-white">
          <h3 className="font-medium mb-2 text-gray-700">Rule Preview</h3>
          <RuleSummaryView formData={summaryData || formData} />
        </div>
      </div>
    </div>
  );
}
