import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Shield,
  AlertTriangle,
  Settings,
  CheckCircle2,
  Clock,
  Info,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import moment from 'moment';
import {
  RiskPolicy,
  RiskCategory,
  RiskSeverity,
  TransactionType,
} from '../utils/risk-management-api';
import {
  RISK_CATEGORY_LABELS,
  RISK_SEVERITY_LABELS,
  RISK_SEVERITY_COLORS,
  TRANSACTION_TYPE_LABELS,
} from '../utils/risk-management-api';
import { Badge } from '@potta/components/shadcn/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { useGetRiskPolicy } from '../hooks/riskManagementHooks';
import PottaLoader from '@potta/components/pottaloader';

interface ViewRiskPolicyModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  policy: RiskPolicy | null;
}

function formatDate(date: string) {
  return moment(date).format('MMM DD, YYYY');
}

const ViewRiskPolicyModal = ({
  open,
  setOpen,
  policy,
}: ViewRiskPolicyModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch the full policy details by ID when modal opens
  const {
    data: fullPolicy,
    isLoading,
    error,
  } = useGetRiskPolicy(policy?.uuid || '');

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!isVisible || !policy) return null;

  // Use the full policy data if available, otherwise fall back to the passed policy
  const displayPolicy = fullPolicy || policy;

  // Show loading state while fetching full policy details
  if (isLoading) {
    return <PottaLoader />;
  }

  // Show error state if fetching failed
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Policy
            </h3>
            <p className="text-gray-600 mb-4">
              Failed to load policy details. Please try again.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity: RiskSeverity) => {
    switch (severity) {
      case RiskSeverity.LOW:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case RiskSeverity.MEDIUM:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case RiskSeverity.HIGH:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case RiskSeverity.CRITICAL:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: RiskCategory) => {
    switch (category) {
      case RiskCategory.INTERNAL:
        return <i className="ri-building-line text-blue-600" />;
      case RiskCategory.EXTERNAL:
        return <i className="ri-external-link-line text-purple-600" />;
      case RiskCategory.LIQUIDITY:
        return <i className="ri-money-dollar-circle-line text-green-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-0 bg-white transition-transform duration-300 ease-in-out transform ${
          isAnimating ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    {displayPolicy.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {getSeverityIcon(displayPolicy.severity)}
                      {RISK_SEVERITY_LABELS[displayPolicy.severity]}
                    </span>
                    <span className="flex items-center gap-1">
                      {getCategoryIcon(displayPolicy.category)}
                      {RISK_CATEGORY_LABELS[displayPolicy.category]}
                    </span>
                    <span className="flex items-center gap-1">
                      {displayPolicy.enabled ? (
                        <>
                          <ToggleRight className="h-3 w-3" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-3 w-3" />
                          Disabled
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Two Side Layout */}
        <div className="flex h-full" style={{ height: 'calc(100vh - 88px)' }}>
          {/* Left Side - Essential Info */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-8">
              {/* Policy Overview */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">
                  Policy Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(displayPolicy.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Last Updated
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(displayPolicy.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rules</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayPolicy.rules?.length || 0}{' '}
                        {(displayPolicy.rules?.length || 0) === 1
                          ? 'Rule'
                          : 'Rules'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {displayPolicy.description && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600">
                    {displayPolicy.description}
                  </p>
                </div>
              )}

              {/* Transaction Types */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Transaction Types
                </h3>
                <div className="space-y-1">
                  {displayPolicy.transactionTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {TRANSACTION_TYPE_LABELS[type]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope */}
              {displayPolicy.scope &&
                Object.keys(displayPolicy.scope).length > 0 && (
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-2">
                      Scope
                    </h3>
                    <div className="space-y-1">
                      {Object.entries(displayPolicy.scope).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-600">
                              {key}: {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Right Side - Detailed Rules */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Risk Rules & Actions
              </h3>

              {displayPolicy.rules && displayPolicy.rules.length > 0 ? (
                <div className="space-y-6">
                  {displayPolicy.rules.map((rule, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-900">
                          Rule {idx + 1} ({rule.operator})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Conditions */}
                        <div>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Conditions ({rule.conditions.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {rule.conditions.map((condition, condIdx) => (
                              <div
                                key={condIdx}
                                className="p-2 bg-gray-50 rounded text-sm"
                              >
                                <span className="text-gray-900">
                                  {condition.field
                                    .replace(/\./g, ' ')
                                    .replace(/([A-Z])/g, ' $1')
                                    .toLowerCase()}
                                </span>
                                <span className="mx-2 text-gray-500">
                                  {condition.operator
                                    .toLowerCase()
                                    .replace('_', ' ')}
                                </span>
                                <span className="text-gray-700">
                                  {String(condition.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Actions ({rule.actions.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {rule.actions.map((action, actionIdx) => (
                              <div
                                key={actionIdx}
                                className="p-2 bg-gray-50 rounded text-sm"
                              >
                                <span className="text-gray-900">
                                  {action.type.toLowerCase().replace('_', ' ')}
                                </span>
                                {action.params &&
                                  Object.keys(action.params).length > 0 && (
                                    <div className="mt-1 text-gray-600">
                                      {Object.entries(action.params).map(
                                        ([key, value]) => (
                                          <div key={key}>
                                            {key}: {String(value)}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">No rules defined</p>
                </div>
              )}

              {/* Global Actions */}
              {displayPolicy.actions && displayPolicy.actions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-medium text-gray-900 mb-3">
                    Global Actions
                  </h4>
                  <div className="space-y-2">
                    {displayPolicy.actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-blue-50 border border-blue-100 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <i className="ri-global-line text-blue-600" />
                          <span className="font-medium capitalize text-gray-700">
                            {action.type.replace('_', ' ')}
                          </span>
                        </div>
                        {action.params &&
                          Object.keys(action.params).length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Parameters:</span>
                              <div className="mt-1 space-y-1">
                                {Object.entries(action.params).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">
                                        {key}:
                                      </span>
                                      <span className="ml-2">
                                        {String(value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Requirements */}
              {policy.submissionRequirements &&
                Object.keys(policy.submissionRequirements).length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <i className="ri-file-check-line text-gray-600" />
                      Submission Requirements
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(policy.submissionRequirements).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-gray-700">
                              {key}:
                            </span>
                            <span className="text-gray-600">
                              {String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRiskPolicyModal;
