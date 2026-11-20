import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  FileText,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react';
import moment from 'moment';
import { GrDocumentText } from 'react-icons/gr';
import { Policy } from '../utils/types';
import { PolicySummaryView } from './PolicySummaryView';

interface ViewPolicyModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  policy: Policy | null;
}

function formatDate(date: string) {
  return moment(date).format('MMM DD, YYYY');
}

const ViewPolicyModal = ({ open, setOpen, policy }: ViewPolicyModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  // Collect all requirements from all rules
  const getAllRequirements = () => {
    const requirements = new Set<string>();

    // Add top-level policy requirements
    if (policy.requireReceipt) requirements.add('Receipt Required');
    if (policy.requireMemo) requirements.add('Memo Required');
    if (policy.requireScreenshots) requirements.add('Screenshots Required');
    if (policy.requireNetSuiteCustomerJob)
      requirements.add('NetSuite Customer/Job');

    // Add mileage requirements
    if (policy.mileageRequirements?.requireGpsCoordinates)
      requirements.add('GPS Coordinates');
    if (policy.mileageRequirements?.businessPurpose)
      requirements.add('Business Purpose');
    if (policy.mileageRequirements?.requireBeforeAfterScreenshots)
      requirements.add('Before/After Screenshots');

    // Add requirements from rules
    policy.rules.forEach((rule) => {
      if (rule.requirements) {
        Object.entries(rule.requirements).forEach(([key, value]) => {
          if (value) {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (s) => s.toUpperCase());
            requirements.add(label);
          }
        });
      }
    });

    return Array.from(requirements);
  };

  const allRequirements = getAllRequirements();

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
              <div>
                <h2 className="text-2xl font-medium text-gray-900">
                  {policy.name}
                </h2>
                <div className="flex items-center gap- mt-1">
                  {getStatusIcon(policy.status)}
                  <span
                    className={`px-2 capitalize  py-1 text-mda font-medium ${
                      policy.status === 'active'
                        ? ' text-green-700'
                        : policy.status === 'pending'
                        ? ' text-gray-600'
                        : ' text-gray-600'
                    }`}
                  >
                    {policy.status || 'Unknown'}
                  </span>
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
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5" />
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
                        {policy.createdAt
                          ? formatDate(policy.createdAt)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50">
                      <GrDocumentText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rules</p>
                      <p className="text-sm font-medium text-gray-900">
                        {policy.rules.length}{' '}
                        {policy.rules.length === 1 ? 'Rule' : 'Rules'}
                      </p>
                    </div>
                  </div>
                </div>
                {policy.transactionType && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Transaction Type:
                      </span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium">
                        {policy.transactionType}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Requirements Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Requirements
                </h3>
                <div className="space-y-3">
                  {allRequirements.length > 0 ? (
                    allRequirements.map((requirement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-gray-700">{requirement}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No specific requirements defined
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {policy.additionalRequirements && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Additional Requirements
                  </h3>
                  <p className="text-sm text-gray-700">
                    {policy.additionalRequirements}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Detailed Rules */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Policy Rules & Requirements
              </h3>
              <PolicySummaryView policy={policy} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPolicyModal;
