import React, { useEffect, useState } from 'react';
import { Policy } from '../utils/types';
import {
  ChevronRight,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Settings,
  Users,
} from 'lucide-react';
import { peopleApi } from '../../payroll/people/utils/api';
import { MdOutlinePendingActions } from 'react-icons/md';

interface PolicySummaryViewProps {
  policy: Policy;
}

interface Employee {
  uuid: string;
  firstName: string;
  lastName: string;
  profile_url?: string;
}

const requirementLabels: Record<
  string,
  { label: string; description: string; icon: React.ReactNode }
> = {
  requireReceipt: {
    label: 'Receipt Required',
    description: 'Must attach receipt for this expense',
    icon: <i className="ri-receipt-2-line text-gray-600" />,
  },
  requireMemo: {
    label: 'Memo Required',
    description: 'Must provide a memo explaining the expense',
    icon: <i className="ri-file-text-line text-gray-600" />,
  },
  requireScreenshots: {
    label: 'Screenshots Required',
    description: 'Must attach screenshots as proof',
    icon: <i className="ri-image-line text-gray-600" />,
  },
  requireNetSuiteCustomerJob: {
    label: 'NetSuite Customer/Job',
    description: 'Must select NetSuite customer or job',
    icon: <i className="ri-briefcase-line text-gray-600" />,
  },
  requireGpsCoordinates: {
    label: 'GPS Coordinates',
    description: 'Must include GPS location data',
    icon: <i className="ri-map-pin-line text-gray-600" />,
  },
  businessPurpose: {
    label: 'Business Purpose',
    description: 'Must specify business purpose',
    icon: <i className="ri-building-2-line text-gray-600" />,
  },
  requireBeforeAfterScreenshots: {
    label: 'Before/After Screenshots',
    description: 'Must provide before and after screenshots',
    icon: <i className="ri-split-cells-horizontal text-gray-600" />,
  },
};

export const PolicySummaryView: React.FC<PolicySummaryViewProps> = ({
  policy,
}) => {
  const [employeeMap, setEmployeeMap] = useState<Record<string, Employee>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Collect all unique user IDs from all actions in all rules
    const userIds = new Set<string>();
    policy.rules.forEach((rule) => {
      rule.actions.forEach((action) => {
        const ids =
          action.parameters?.users ||
          (action.parameters && 'selectedUserIds' in action.parameters
            ? action.parameters.selectedUserIds
            : []) ||
          [];
        ids.forEach((id: string) => userIds.add(id));
      });
    });
    if (userIds.size === 0) return;
    setLoading(true);
    // Fetch employee details in bulk using peopleApi
    peopleApi
      .filterPersons({ ids: Array.from(userIds) })
      .then((res) => {
        const employees: Employee[] = res.data || [];
        const map: Record<string, Employee> = {};
        employees.forEach((emp) => {
          map[emp.uuid] = emp;
        });
        setEmployeeMap(map);
      })
      .finally(() => setLoading(false));
  }, [policy]);

  if (!policy || !policy.rules || policy.rules.length === 0) {
    return (
      <div className="border border-gray-200 p-6 bg-gray-50 text-center text-gray-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No rules defined for this policy.</p>
      </div>
    );
  }

  return (
    <div className="rule-summary border rounded-md p-4 bg-white">
      {policy.rules.map((rule, ruleIndex) => (
        <div key={rule.uuid || rule.id || ruleIndex} className="mb-8">
          {/* FIRST LEVEL: IF Statement */}
          <div className="flex items-start">
            <div className="min-w-[36px] flex justify-center">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600">
                <ChevronRight size={16} />
              </span>
            </div>
            <div className="font-medium text-xl text-gray-700">IF</div>
          </div>

          {/* Conditions */}
          <div></div>
          {rule.conditions.map((condition, condIndex) => (
            <div key={condition.id} className="mb-2 ml-10 flex items-center">
              <div className="flex items-start">
                <div className="flex-1">
                  {condition.criterionType && condition.comparisonOperator ? (
                    <div>
                      <span className="font-medium">
                        {condition.criterionType}
                      </span>{' '}
                      <span className="text-gray-500">
                        {condition.comparisonOperator}
                      </span>{' '}
                      <span className="text-gray-700">{condition.value}</span>
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
          <div className="ml-10 border-l border-gray-200 pl-[18px] mt-2">
            {/* Actions */}
            {rule.actions && rule.actions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-start">
                  <div className="min-w-[36px] flex justify-center">
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-50 text-indigo-500">
                      <UserCheck size={14} />
                    </span>
                  </div>
                  <div className="">
                    <div className="text-gray-500 font-medium mb-1">Then</div>
                    {rule.actions.map((action, actionIndex) => {
                      const userIds =
                        action.parameters?.users ||
                        (action.parameters &&
                        'selectedUserIds' in action.parameters
                          ? action.parameters.selectedUserIds
                          : []) ||
                        [];
                      return (
                        <div
                          key={actionIndex}
                          className="ml-2 flex items-center space-x-2"
                        >
                          <div className="font-medium text-indigo-600">
                            {action.type}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {loading ? (
                              <span className="text-gray-400 italic">
                                Loading approvers...
                              </span>
                            ) : userIds.length > 0 ? (
                              userIds.map((userId, idx) => {
                                const emp = employeeMap[userId];
                                return (
                                  <span
                                    key={userId}
                                    className="bg-blue-50 border border-blue-100 px-2 py-0.5 text-sm rounded text-blue-700"
                                  >
                                    {emp
                                      ? `${emp.firstName} ${emp.lastName}`
                                      : userId}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-gray-400 italic">
                                No users assigned
                              </span>
                            )}
                          </div>
                          {/* Add divider between actions if needed */}
                          {actionIndex < rule.actions.length - 1 && (
                            <div className="my-2 text-sm text-gray-500 font-medium">
                              and
                            </div>
                          )}
                        </div>
                      );
                    })}
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
          {ruleIndex < policy.rules.length - 1 && (
            <div className="my-6 border-t border-gray-200"></div>
          )}
        </div>
      ))}
    </div>
  );
};
