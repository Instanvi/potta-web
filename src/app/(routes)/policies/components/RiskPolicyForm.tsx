'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Shield } from 'lucide-react';
import {
  RiskPolicy,
  CreateRiskPolicyRequest,
  UpdateRiskPolicyRequest,
  RiskCategory,
  RiskSeverity,
  TransactionType,
  RiskRule,
  RiskCondition,
  RiskAction,
  RiskOperator,
  RiskActionType,
  RISK_FIELD_CONFIGS,
  RISK_CATEGORY_LABELS,
  TRANSACTION_TYPE_LABELS,
  RISK_OPERATOR_LABELS,
  RISK_ACTION_TYPE_LABELS,
} from '../utils/risk-management-api';
import { Button } from '@potta/components/shadcn/button';
import { Input } from '@potta/components/shadcn/input';
import { Label } from '@potta/components/shadcn/label';
import { Textarea } from '@potta/components/shadcn/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { Checkbox } from '@potta/components/shadcn/checkbox';
import { Badge } from '@potta/components/shadcn/badge';

interface RiskPolicyFormProps {
  initialData?: RiskPolicy | null;
  onSubmit: (data: CreateRiskPolicyRequest | UpdateRiskPolicyRequest) => void;
  onCancel: () => void;
}

const RiskPolicyForm: React.FC<RiskPolicyFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  // Helper function to format field names for display
  const formatFieldName = (field: string) => {
    if (!field) return 'Field';
    const fieldName = field.split('.').pop() || field;
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const [formData, setFormData] = useState<CreateRiskPolicyRequest>({
    name: '',
    description: '',
    category: RiskCategory.INTERNAL,
    transactionTypes: [],
    severity: RiskSeverity.MEDIUM,
    enabled: true,
    rules: [],
    actions: [],
    scope: {},
    submissionRequirements: {},
  });

  // Initialize form data when initialData is provided (edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        category: initialData.category,
        transactionTypes: initialData.transactionTypes,
        severity: initialData.severity,
        enabled: initialData.enabled,
        rules: initialData.rules || [],
        actions: initialData.actions || [],
        scope: initialData.scope || {},
        submissionRequirements: initialData.submissionRequirements || {},
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        category: RiskCategory.INTERNAL,
        transactionTypes: [],
        severity: RiskSeverity.MEDIUM,
        enabled: true,
        rules: [],
        actions: [],
        scope: {},
        submissionRequirements: {},
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!formData.name.trim()) {
      alert('Policy name is required');
      return;
    }

    if (!formData.rules || formData.rules.length === 0) {
      alert('At least one rule is required');
      return;
    }

    onSubmit(formData);
  };

  const addRule = () => {
    const newRule: RiskRule = {
      operator: 'AND',
      conditions: [
        {
          field: '',
          operator: RiskOperator.EQUALS,
          value: '',
        },
      ],
      actions: [
        {
          type: RiskActionType.BLOCK,
          params: {},
        },
      ],
    };

    setFormData({
      ...formData,
      rules: [...(formData.rules || []), newRule],
    });
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: (formData.rules || []).filter(
        (_: RiskRule, i: number) => i !== index
      ),
    });
  };

  const updateRule = (index: number, updatedRule: RiskRule) => {
    const newRules = [...(formData.rules || [])];
    newRules[index] = updatedRule;
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const addCondition = (ruleIndex: number) => {
    const newCondition: RiskCondition = {
      field: '',
      operator: RiskOperator.EQUALS,
      value: '',
    };

    const newRules = [...(formData.rules || [])];
    newRules[ruleIndex].conditions.push(newCondition);
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const removeCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...(formData.rules || [])];
    newRules[ruleIndex].conditions = newRules[ruleIndex].conditions.filter(
      (_: RiskCondition, i: number) => i !== conditionIndex
    );
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const updateCondition = (
    ruleIndex: number,
    conditionIndex: number,
    updatedCondition: RiskCondition
  ) => {
    const newRules = [...(formData.rules || [])];
    newRules[ruleIndex].conditions[conditionIndex] = updatedCondition;
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const addAction = (ruleIndex: number) => {
    const newAction: RiskAction = {
      type: RiskActionType.BLOCK,
      params: {},
    };

    const newRules = [...(formData.rules || [])];
    newRules[ruleIndex].actions.push(newAction);
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const removeAction = (ruleIndex: number, actionIndex: number) => {
    const newRules = [...(formData.rules || [])];
    newRules[ruleIndex].actions = newRules[ruleIndex].actions.filter(
      (_: RiskAction, i: number) => i !== actionIndex
    );
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const updateAction = (
    ruleIndex: number,
    actionIndex: number,
    updatedAction: RiskAction
  ) => {
    const newRules = [...(formData.rules || [])];
    newRules[ruleIndex].actions[actionIndex] = updatedAction;
    setFormData({
      ...formData,
      rules: newRules,
    });
  };

  const handleTransactionTypeChange = (
    type: TransactionType,
    checked: boolean
  ) => {
    if (checked) {
      setFormData({
        ...formData,
        transactionTypes: [...formData.transactionTypes, type],
      });
    } else {
      setFormData({
        ...formData,
        transactionTypes: formData.transactionTypes.filter((t) => t !== type),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 overflow-hidden lg:grid-cols-2 gap-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Policy Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="rounded-none"
              placeholder="Enter policy name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              className="rounded-none"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter policy description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as RiskCategory,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RiskCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {RISK_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    severity: value as RiskSeverity,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(RiskSeverity).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: !!checked })
              }
            />
            <Label htmlFor="enabled">Enabled</Label>
          </div>
        </div>

        {/* Transaction Types */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Transaction Types</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(TransactionType).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={formData.transactionTypes.includes(type)}
                  onCheckedChange={(checked) =>
                    handleTransactionTypeChange(type, !!checked)
                  }
                />
                <Label htmlFor={type} className="text-sm">
                  {TRANSACTION_TYPE_LABELS[type]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Risk Rules *</Label>
          </div>

          {(formData.rules || []).map((rule, ruleIndex) => (
            <div key={ruleIndex} className="mb-4">
              <div className="border border-gray-200  p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Rule {ruleIndex + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Select
                      value={rule.operator}
                      onValueChange={(value) =>
                        updateRule(ruleIndex, {
                          ...rule,
                          operator: value as 'AND' | 'OR',
                        })
                      }
                    >
                      <SelectTrigger className="w-20 !py-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRule(ruleIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Conditions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCondition(ruleIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  {rule.conditions.map((condition, conditionIndex) => (
                    <div
                      key={conditionIndex}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded"
                    >
                      <Select
                        value={condition.field}
                        onValueChange={(value) =>
                          updateCondition(ruleIndex, conditionIndex, {
                            ...condition,
                            field: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(RISK_FIELD_CONFIGS).map(
                            ([field, config]) => (
                              <SelectItem key={field} value={field}>
                                {config.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(ruleIndex, conditionIndex, {
                            ...condition,
                            operator: value as RiskOperator,
                          })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(RiskOperator).map((op) => (
                            <SelectItem key={op} value={op}>
                              {RISK_OPERATOR_LABELS[op]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(ruleIndex, conditionIndex, {
                            ...condition,
                            value: e.target.value,
                          })
                        }
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          removeCondition(ruleIndex, conditionIndex)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Actions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAction(ruleIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Action
                    </Button>
                  </div>
                  {rule.actions.map((action, actionIndex) => (
                    <div
                      key={actionIndex}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded"
                    >
                      <Select
                        value={action.type}
                        onValueChange={(value) =>
                          updateAction(ruleIndex, actionIndex, {
                            ...action,
                            type: value as RiskActionType,
                          })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(RiskActionType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {RISK_ACTION_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAction(ruleIndex, actionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRule}
            className="flex items-center mt-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
          <Button type="submit">
            {initialData ? 'Update Policy' : 'Create Policy'}
          </Button>
        </div>
      </form>

      {/* Policy Preview - Right Side */}
      <div className="lg:block h-[calc(100vh-200px)] overflow-y-auto">
        <div className="sticky top-0 bg-white">
          <h3 className="font-medium mb-2 text-gray-700">Policy Preview</h3>
          <div className="space-y-4">
            {/* Policy Overview */}
            <div className="p-4 border border-gray-200 ">
              <h4 className="font-medium text-gray-900 mb-2">
                {formData.name || 'Untitled Policy'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {formData.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {RISK_CATEGORY_LABELS[formData.category]}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formData.severity}
                </Badge>
                <Badge
                  variant={formData.enabled ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {formData.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>

            {/* Transaction Types */}
            <div className="p-4 border border-gray-200 ">
              <h4 className="font-medium text-gray-900 mb-2">
                Transaction Types
              </h4>
              <div className="flex flex-wrap gap-1">
                {formData.transactionTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="text-xs text-gray-700 font-medium rounded-full bg-green-100 "
                  >
                    {TRANSACTION_TYPE_LABELS[type]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rules Summary */}
            <div className="rule-summary border rounded-md p-4 bg-white">
              {formData.rules && formData.rules.length > 0 ? (
                formData.rules.map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="mb-8">
                    {/* FIRST LEVEL: IF Statement */}
                    <div className="flex items-start">
                      <div className="min-w-[36px] flex justify-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600">
                          <Plus size={16} />
                        </span>
                      </div>
                      <div className="font-medium text-xl text-gray-700">
                        IF
                      </div>
                    </div>

                    {/* Conditions */}
                    <div></div>
                    {rule.conditions.map((condition, condIndex) => (
                      <div
                        key={condIndex}
                        className="mb-2 ml-10 flex items-center"
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            {condition.field && condition.operator ? (
                              <div>
                                <span className="font-medium">
                                  {formatFieldName(condition.field)}
                                </span>{' '}
                                <span className="text-gray-500">
                                  {RISK_OPERATOR_LABELS[condition.operator] ||
                                    condition.operator}
                                </span>{' '}
                                <span className="text-gray-700">
                                  {condition.value || 'value'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                Incomplete condition
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add "and" between conditions */}
                        {condIndex < rule.conditions.length - 1 && (
                          <div className="ml-2 text-sm text-gray-500 font-medium">
                            and
                          </div>
                        )}
                      </div>
                    ))}

                    {/* SECOND LEVEL: Actions */}
                    <div className="ml-10 border-l border-gray-200 pl-[18px] mt-2">
                      {/* Actions */}
                      {rule.actions && rule.actions.length > 0 && (
                        <div className="mt-4">
                          <div className="flex items-start">
                            <div className="min-w-[36px] flex justify-center">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 text-indigo-500">
                                <Shield size={14} />
                              </span>
                            </div>
                            <div className="">
                              <div className="text-gray-500 font-medium mb-1">
                                Then
                              </div>
                              {rule.actions.map((action, actionIndex) => (
                                <div
                                  key={actionIndex}
                                  className="ml-2 flex items-center space-x-2"
                                >
                                  <div className="font-medium text-indigo-600">
                                    {RISK_ACTION_TYPE_LABELS[action.type] ||
                                      action.type}
                                  </div>
                                  {/* Add divider between actions if needed */}
                                  {actionIndex < rule.actions.length - 1 && (
                                    <div className="my-2 text-sm text-gray-500 font-medium">
                                      and
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display message if no actions are defined */}
                      {(!rule.actions || rule.actions.length === 0) && (
                        <div className="mt-4">
                          <div className="flex items-start">
                            <div className="min-w-[36px] flex justify-center">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 text-gray-400">
                                <Shield size={14} />
                              </span>
                            </div>
                            <div className="text-gray-400 italic">
                              No actions defined
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Separator between multiple rules */}
                    {ruleIndex < formData.rules.length - 1 && (
                      <div className="my-6 border-t border-gray-200"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 italic">No rules defined</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPolicyForm;
