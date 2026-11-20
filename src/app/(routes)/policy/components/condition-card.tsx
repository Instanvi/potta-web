import React from 'react';
import { Button } from '@potta/components/shadcn/button';
import { Label } from '@potta/components/shadcn/label';
import { Checkbox } from '@potta/components/shadcn/checkbox';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/shadcn/card';
import { X, PlusCircle } from 'lucide-react';

import {
  ExtendedCondition,
  ConditionDetail,
  ConditionAction,
  ApproverActionType,
  ApprovalMode,
  User,
  EntityReference, // Added EntityReference type
} from '../types/approval-rule';
import { generateId } from '../utils/approval-rule-utils';
import { ConditionDetailComponent } from './condition-detail';
import { ActionItem } from './action-item';
import { Separator } from '@potta/components/shadcn/seperator';

// Helper function to check if a field is an entity-type field
const isEntityField = (field: string): boolean => {
  return [
    'vendor',
    'department',
    'customer',
    'expense category',
    'inventory item',
    'location branch',
    'payment type',
  ].includes(field.toLowerCase());
};

interface ConditionCardProps {
  condition: ExtendedCondition;
  index: number;
  users: User[];
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (updatedCondition: ExtendedCondition) => void;
}

export const ConditionCard: React.FC<ConditionCardProps> = ({
  condition,
  index,
  users,
  canRemove,
  onRemove,
  onUpdate,
}) => {
  // State for user selection in actions
  const [actionUserSelectionState, setActionUserSelectionState] =
    React.useState<{
      actionId: string;
      isOpen: boolean;
      searchQuery: string;
    }>({
      actionId: '',
      isOpen: false,
      searchQuery: '',
    });

  // Check if an action type already exists in the condition
  const hasActionType = (type: ApproverActionType): boolean => {
    return (condition.actions || []).some((action) => action.type === type);
  };

  // Check if we've reached the maximum number of actions (2)
  const hasMaxActions = (condition.actions || []).length >= 2;

  // Add a new condition detail with proper defaults
  const addConditionDetail = () => {
    const updatedCondition = {
      ...condition,
      conditions: [
        ...(condition.conditions || []),
        {
          id: generateId('cd'),
          field: '',
          operator: '',
          value: '',
        },
      ],
    };
    onUpdate(updatedCondition);
  };

  // Remove a condition detail with validation
  const removeConditionDetail = (detailId: string) => {
    // Don't allow removing the last detail
    if ((condition.conditions || []).length <= 1) {
      return;
    }

    const updatedCondition = {
      ...condition,
      conditions: (condition.conditions || []).filter(
        (detail) => detail.id !== detailId
      ),
    };
    onUpdate(updatedCondition);
  };

  // Update a condition detail with type safety
  // MODIFIED: Added handling for entity reference values
  const updateConditionDetail = (
    detailId: string,
    field: keyof ConditionDetail,
    value: any
  ) => {
    const updatedCondition = {
      ...condition,
      conditions: (condition.conditions || []).map((detail) => {
        if (detail.id === detailId) {
          // If updating the field, check if we need to reset the value based on field type
          if (field === 'field') {
            const isNewFieldEntity = isEntityField(value);
            const isOldFieldEntity = detail.field
              ? isEntityField(detail.field)
              : false;

            // If changing between entity and non-entity fields OR if field was previously empty
            if (isNewFieldEntity !== isOldFieldEntity || !detail.field) {
              return {
                ...detail,
                [field]: value,
                value: isNewFieldEntity ? null : '',
              };
            }
          }

          // If updating the operator and it's an entity field
          if (field === 'operator' && isEntityField(detail.field)) {
            const isMultiSelect =
              value === 'is one of' || value === 'is not one of';
            const isCurrentMultiSelect =
              detail.operator === 'is one of' ||
              detail.operator === 'is not one of';

            // If changing between single and multi-select operators, reset the value
            if (isMultiSelect !== isCurrentMultiSelect) {
              return {
                ...detail,
                [field]: value,
                value: isMultiSelect ? [] : null,
              };
            }
          }

          // If updating the value and it's an entity field
          if (field === 'value' && isEntityField(detail.field)) {
            // Ensure entity values have consistent structure
            if (Array.isArray(value)) {
              // For multi-select, ensure each item has id and name
              const normalizedValue = value.map((item) => {
                if (typeof item === 'object' && item !== null) {
                  // Extract just id and name for consistency
                  return {
                    id: item.id || item.value || '',
                    name: item.name || item.label || '',
                  };
                }
                return item; // Fallback for non-object items
              });
              return { ...detail, [field]: normalizedValue };
            } else if (value && typeof value === 'object') {
              // For single-select, ensure it has id and name
              const normalizedValue = {
                id: value.id || value.value || '',
                name: value.name || value.label || '',
              };
              return { ...detail, [field]: normalizedValue };
            }
          }

          // Default case - no special handling needed
          return { ...detail, [field]: value };
        }
        return detail;
      }),
    };
    onUpdate(updatedCondition);
  };

  // Add a new action with validation and proper defaults
  const addAction = (actionType: ApproverActionType) => {
    // Don't add if we've reached the maximum or if this type already exists
    if (hasMaxActions || hasActionType(actionType)) {
      return;
    }

    const updatedCondition = {
      ...condition,
      actions: [
        ...(condition.actions || []),
        {
          id: generateId('action'),
          type: actionType,
          mode:
            actionType === ApproverActionType.APPROVAL
              ? ApprovalMode.ALL
              : ApprovalMode.ALL,
          users: [], // Empty users array
          userIds: [], // Empty userIds array
        },
      ],
    };
    onUpdate(updatedCondition);
  };

  // Remove an action with cleanup
  const removeAction = (actionId: string) => {
    // If this is the action currently being edited, reset the selection state
    if (actionUserSelectionState.actionId === actionId) {
      setActionUserSelectionState({
        actionId: '',
        isOpen: false,
        searchQuery: '',
      });
    }

    const updatedCondition = {
      ...condition,
      actions: (condition.actions || []).filter(
        (action) => action.id !== actionId
      ),
    };
    onUpdate(updatedCondition);
  };

  // Update action mode with validation
  const updateActionMode = (actionId: string, mode: ApprovalMode) => {
    const updatedCondition = {
      ...condition,
      actions: (condition.actions || []).map((action) => {
        if (action.id === actionId) {
          return {
            ...action,
            mode,
          };
        }
        return action;
      }),
    };
    onUpdate(updatedCondition);
  };

  // Open user selection for an action with state reset
  const openActionUserSelection = (actionId: string) => {
    setActionUserSelectionState({
      actionId,
      isOpen: true,
      searchQuery: '',
    });
  };

  // Add user to action - MODIFIED to store full User object
  const addUserToAction = (actionId: string, user: User) => {
    // Ensure we don't add duplicate users
    const updatedCondition = {
      ...condition,
      actions: (condition.actions || []).map((action) => {
        if (
          action.id === actionId &&
          !action.users?.some((u) => u.id === user.id)
        ) {
          return {
            ...action,
            users: [...(action.users || []), user], // Store full user object
            userIds: [...(action.userIds || []), user.id], // Keep userIds for backward compatibility
          };
        }
        return action;
      }),
    };
    onUpdate(updatedCondition);
    setActionUserSelectionState({
      ...actionUserSelectionState,
      isOpen: false,
    });
  };

  // Remove user from action - MODIFIED to handle full User objects
  const removeUserFromAction = (actionId: string, user: User) => {
    const updatedCondition = {
      ...condition,
      actions: (condition.actions || []).map((action) => {
        if (action.id === actionId) {
          return {
            ...action,
            users: (action.users || []).filter((u) => u.id !== user.id), // Filter full user objects
            userIds: (action.userIds || []).filter((id) => id !== user.id), // Keep userIds for backward compatibility
          };
        }
        return action;
      }),
    };
    onUpdate(updatedCondition);
  };

  // Update requirement checkbox with proper type handling
  const updateRequirement = (field: string, checked: boolean) => {
    // Create or update the requirements object with proper defaults
    const requirements = {
      requireReceipt: false,
      requireMemo: false,
      requireScreenshots: false,
      requireNetSuiteCustomerJob: false,
      requireGpsCoordinates: false,
      businessPurpose: false,
      requireBeforeAfterScreenshots: false,
      ...(condition.requirements || {}),
      [field]: checked,
    };

    const updatedCondition = {
      ...condition,
      requirements,
    };
    onUpdate(updatedCondition);
  };

  // Get requirement value from requirements object or direct property
  const getRequirementValue = (field: string): boolean => {
    if (condition.requirements && condition.requirements[field] !== undefined) {
      return !!condition.requirements[field];
    }
    // Fall back to direct property for backward compatibility
    return !!condition[field as keyof ExtendedCondition];
  };

  // ADDED: Helper function to ensure actions have both users and userIds
  const ensureActionsHaveUsers = () => {
    if (!condition.actions) return;

    // Check if we need to populate users array from userIds or vice versa
    const needsUpdate = condition.actions.some(
      (action) =>
        (action.userIds?.length > 0 &&
          (!action.users ||
            (action.users?.length ?? 0) !== action.userIds.length)) ||
        ((action.users?.length ?? 0) > 0 &&
          (!action.userIds ||
            action.userIds.length !== (action.users?.length ?? 0)))
    );

    if (needsUpdate) {
      const updatedActions = condition.actions.map((action) => {
        // Initialize empty arrays if they don't exist
        const userIds = action.userIds || [];
        const actionUsers = action.users || [];

        // If userIds has values but users doesn't match, populate users
        if (userIds.length > 0 && actionUsers.length !== userIds.length) {
          const newUsers = userIds.map((userId) => {
            const user = users.find((u) => u.id === userId);
            return user || { id: userId, name: 'Unknown User', email: '' }; // Fallback if user not found
          });

          return {
            ...action,
            users: newUsers,
            userIds: userIds,
          };
        }

        // If users has values but userIds doesn't match, populate userIds
        if (actionUsers.length > 0 && userIds.length !== actionUsers.length) {
          const newUserIds = actionUsers.map((user) => user.id);

          return {
            ...action,
            users: actionUsers,
            userIds: newUserIds,
          };
        }

        // Ensure both arrays exist even if empty
        return {
          ...action,
          users: actionUsers,
          userIds: userIds,
        };
      });

      const updatedCondition = {
        ...condition,
        actions: updatedActions,
      };

      onUpdate(updatedCondition);
    }
  };

  // ADDED: Helper function to normalize entity values in conditions
  const normalizeEntityValues = () => {
    if (!condition.conditions) return;

    const needsUpdate = condition.conditions.some((detail) => {
      if (!isEntityField(detail.field)) return false;

      // Check if value needs normalization
      if (Array.isArray(detail.value)) {
        // Check if any array item is missing id or name, or has extra properties
        return detail.value.some(
          (item) =>
            typeof item === 'object' &&
            (!item.id || !item.name || Object.keys(item).length > 2)
        );
      } else if (detail.value && typeof detail.value === 'object') {
        // Check if single object is missing id or name, or has extra properties
        const val = detail.value as any;
        return !val.id || !val.name || Object.keys(val).length > 2;
      }

      return false;
    });

    if (needsUpdate) {
      const updatedConditions = condition.conditions.map((detail) => {
        if (!isEntityField(detail.field)) return detail;

        let normalizedValue = detail.value;

        if (Array.isArray(detail.value)) {
          normalizedValue = detail.value.map((item) => {
            if (typeof item === 'object' && item !== null) {
              return {
                id: item.id || item.value || '',
                name: item.name || item.label || '',
              };
            }
            return item;
          });
        } else if (detail.value && typeof detail.value === 'object') {
          const val = detail.value as any;
          normalizedValue = {
            id: val.id || val.value || '',
            name: val.name || val.label || '',
          };
        }

        return {
          ...detail,
          value: normalizedValue,
        };
      });

      const updatedCondition = {
        ...condition,
        conditions: updatedConditions,
      };

      onUpdate(updatedCondition);
    }
  };

  // Call the helper functions when component mounts or relevant props change
  React.useEffect(() => {
    ensureActionsHaveUsers();
    normalizeEntityValues();
  }, [users, condition.conditions]);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between">
          <span>Rule {index + 1}</span>
          {canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Condition Details Section */}
        <div className="space-y-2">
          {(condition.conditions || []).map((detail) => (
            <ConditionDetailComponent
              key={detail.id}
              detail={detail}
              canRemove={(condition.conditions || []).length > 1}
              onUpdate={(field, value) =>
                updateConditionDetail(detail.id, field, value)
              }
              onRemove={() => removeConditionDetail(detail.id)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addConditionDetail}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Condition
        </Button>

        <Separator />

        {/* Actions Section */}
        <div className="space-y-4">
          <Label>Actions</Label>
          {(condition.actions || []).length === 0 && (
            <div className="text-sm text-muted-foreground">
              No actions added yet
            </div>
          )}

          {(condition.actions || []).map((action) => (
            <ActionItem
              key={action.id}
              action={action}
              users={users}
              onRemove={() => removeAction(action.id)}
              onUpdateMode={(mode) => updateActionMode(action.id, mode)}
              onAddUser={(user) => addUserToAction(action.id, user)}
              onRemoveUser={(user) => removeUserFromAction(action.id, user)}
              isUserSelectionOpen={
                actionUserSelectionState.isOpen &&
                actionUserSelectionState.actionId === action.id
              }
              onUserSelectionOpenChange={(isOpen) => {
                if (isOpen) {
                  openActionUserSelection(action.id);
                } else {
                  setActionUserSelectionState({
                    ...actionUserSelectionState,
                    isOpen: false,
                  });
                }
              }}
              userSearchQuery={actionUserSelectionState.searchQuery}
              onUserSearchQueryChange={(query) =>
                setActionUserSelectionState({
                  ...actionUserSelectionState,
                  searchQuery: query,
                })
              }
            />
          ))}

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => addAction(ApproverActionType.APPROVAL)}
              disabled={
                hasMaxActions || hasActionType(ApproverActionType.APPROVAL)
              }
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Approval
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => addAction(ApproverActionType.NOTIFICATION)}
              disabled={
                hasMaxActions || hasActionType(ApproverActionType.NOTIFICATION)
              }
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Notification
            </Button>
          </div>
        </div>

        <Separator />

        {/* Requirements Section */}
        <div className="space-y-2">
          <Label>Requirements</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`requireReceipt-${condition.id}`}
                checked={getRequirementValue('requireReceipt')}
                onCheckedChange={(checked) =>
                  updateRequirement('requireReceipt', !!checked)
                }
              />
              <Label htmlFor={`requireReceipt-${condition.id}`}>
                Require Receipt
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`requireMemo-${condition.id}`}
                checked={getRequirementValue('requireMemo')}
                onCheckedChange={(checked) =>
                  updateRequirement('requireMemo', !!checked)
                }
              />
              <Label htmlFor={`requireMemo-${condition.id}`}>
                Require Memo
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`requireScreenshots-${condition.id}`}
                checked={getRequirementValue('requireScreenshots')}
                onCheckedChange={(checked) =>
                  updateRequirement('requireScreenshots', !!checked)
                }
              />
              <Label htmlFor={`requireScreenshots-${condition.id}`}>
                Require Screenshots
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`requireNetSuiteCustomerJob-${condition.id}`}
                checked={getRequirementValue('requireNetSuiteCustomerJob')}
                onCheckedChange={(checked) =>
                  updateRequirement('requireNetSuiteCustomerJob', !!checked)
                }
              />
              <Label htmlFor={`requireNetSuiteCustomerJob-${condition.id}`}>
                Require NetSuite Customer Job
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`requireGpsCoordinates-${condition.id}`}
                checked={getRequirementValue('requireGpsCoordinates')}
                onCheckedChange={(checked) =>
                  updateRequirement('requireGpsCoordinates', !!checked)
                }
              />
              <Label htmlFor={`requireGpsCoordinates-${condition.id}`}>
                Require GPS Coordinates
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`businessPurpose-${condition.id}`}
                checked={getRequirementValue('businessPurpose')}
                onCheckedChange={(checked) =>
                  updateRequirement('businessPurpose', !!checked)
                }
              />
              <Label htmlFor={`businessPurpose-${condition.id}`}>
                Business Purpose
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`requireBeforeAfterScreenshots-${condition.id}`}
                checked={getRequirementValue('requireBeforeAfterScreenshots')}
                onCheckedChange={(checked) =>
                  updateRequirement('requireBeforeAfterScreenshots', !!checked)
                }
              />
              <Label htmlFor={`requireBeforeAfterScreenshots-${condition.id}`}>
                Require Before/After Screenshots
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
