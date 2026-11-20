'use client';

import React from 'react';
import { ExtendedApprovalRule, FieldType } from '../types/approval-rule';
import {
  formatFieldValue,
  getFieldDisplayName,
} from '../utils/approval-rule-utils';
import {
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';

interface RuleSummaryViewProps {
  formData: ExtendedApprovalRule;
}

export const RuleSummaryView: React.FC<RuleSummaryViewProps> = ({
  formData,
}) => {
  if (!formData || !formData.rules || formData.rules.length === 0) {
    return (
      <div className="rule-summary border rounded-md p-4 bg-white">
        <p className="text-gray-500 text-center py-4">No rules defined yet</p>
      </div>
    );
  }

  // Helper function to ensure string or string array
  const ensureStringOrStringArray = (value: any): string | string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  };

  // Helper to display formatted value based on field type
  const displayValue = (field: string, value: string | string[]) => {
    // Special formatting for entity fields
    switch (field) {
      case FieldType.PAYMENT_TYPE:
      case FieldType.VENDOR:
      case FieldType.CUSTOMER:
      case FieldType.INVENTORY_ITEM:
        if (Array.isArray(value)) {
          return value.map((val, idx) => (
            <React.Fragment key={idx}>
              <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                {val}
              </span>
              {idx < value.length - 1 && <span className="mx-1">,</span>}
            </React.Fragment>
          ));
        } else if (value) {
          return (
            <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
              {value}
            </span>
          );
        }
        return <span className="text-gray-400">None</span>;
      default:
        return formatFieldValue(value);
    }
  };

  // Helper to format action type and mode
  const getActionLabel = (type: string, mode: string) => {
    const actionType = type.charAt(0).toUpperCase() + type.slice(1);
    const actionMode = mode === 'any' ? 'Any' : 'All';
    const at = actionType === 'Approval' ? 'Request Approval From' : 'Notify';
    return `${at}  ${actionMode}`;
  };

  return (
    <div className="rule-summary border rounded-md p-4 bg-white">
      {formData.rules.map((rule, ruleIndex) => (
        <div key={rule.id} className="mb-8 ">
          {/* FIRST LEVEL: IF Statement */}
          <div className="flex items-start">
            <div className="min-w-[36px] flex justify-center">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600">
                <ChevronRight size={16} />
              </span>
            </div>
            <div className="font-medium text-xl text-gray-700  ">IF</div>
          </div>
          {/* Conditions */}
          <div></div>
          {rule.conditions.map((condition, condIndex) => (
            <div key={condition.id} className="mb-2 ml-10 flex items-center">
              <div className="flex items-start">
                <div className="flex-1">
                  {condition.field && condition.operator ? (
                    <div>
                      <span className="font-medium">
                        {getFieldDisplayName(condition.field)}
                      </span>{' '}
                      <span className="text-gray-500">
                        {condition.operator}
                      </span>{' '}
                      {displayValue(
                        condition.field,
                        ensureStringOrStringArray(condition.value)
                      )}
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
          {/* SECOND LEVEL: Conditions, Requirements, Actions */}
          <div className="ml-10 border-l border-gray-200 pl-[18px] mt-2 ">
            {/* Actions */}
            {rule.actions && rule.actions.length > 0 && (
              <div className="mt-4 ">
                <div className="flex items-start">
                  <div className="min-w-[36px] flex justify-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 text-indigo-500">
                      <UserCheck size={14} />
                    </span>
                  </div>
                  <div className="">
                    <div className="text-gray-500 font-medium mb-1">Then</div>
                    {rule.actions.map((action, actionIndex) => (
                      <div
                        key={actionIndex}
                        className=" ml-2 flex items-center space-x-2"
                      >
                        <div className="font-medium text-indigo-600">
                          {getActionLabel(action.type, action.mode)}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {action.userIds.length > 0 ? (
                            action.userIds.map((userId, idx) => (
                              <span
                                key={userId}
                                className="bg-blue-50 border border-blue-100 px-2 py-0.5 text-sm rounded text-blue-700"
                              >
                                {userId}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">
                              No users assigned
                            </span>
                          )}
                        </div>
                        {/* Add divider between actions if needed */}
                        {actionIndex < rule.actions.length - 1 && (
                          <div className=" my-2 text-sm text-gray-500 font-medium">
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
                      <UserCheck size={14} />
                    </span>
                  </div>
                  <div className="text-gray-400 italic">No actions defined</div>
                </div>
              </div>
            )}
            {/* Requirements */}
            {rule.requirements &&
              Object.values(rule.requirements).some((v) => v === true) && (
                <div className="mb-3 mt-4">
                  <div className="flex items-start">
                    <div className="min-w-[36px] flex justify-center">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-50 text-green-500">
                        <CheckCircle2 size={14} />
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="text-gray-500 font-medium mb-1">
                        Require
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rule.requirements.requireMemo && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            Memo
                          </span>
                        )}

                        {rule.requirements.requireReceipt && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            Receipt
                          </span>
                        )}

                        {rule.requirements.requireNetSuiteCustomerJob && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            NetSuite Customer/Job
                          </span>
                        )}

                        {rule.requirements.requireScreenshots && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            Screenshots
                          </span>
                        )}

                        {rule.requirements.requireGpsCoordinates && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            GPS Coordinates
                          </span>
                        )}

                        {rule.requirements.businessPurpose && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            Business Purpose
                          </span>
                        )}

                        {rule.requirements.requireBeforeAfterScreenshots && (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 text-sm rounded">
                            Before/After Screenshots
                          </span>
                        )}
                      </div>
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
      ))}
    </div>
  );
};
