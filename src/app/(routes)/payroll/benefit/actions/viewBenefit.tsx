import React from 'react';
import Slider from '@potta/components/slideover';
import moment from 'moment';
import {
  formatCurrencyWithoutDecimals,
  formatPercentageWithoutDecimals,
  formatNumberWithoutDecimals,
} from '../utils/formUtils';

interface Benefit {
  uuid: string;
  name: string;
  description: string;
  type: 'FINANCIAL' | 'SERVICE' | 'REDEEMABLE';
  value: string;
  cycle:
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'QUARTERLY'
    | 'ANNUALLY'
    | 'ONE_TIME'
    | 'NONE';
  is_taxable: boolean;
  tax_cap: string;
  rate: string;
  salary_cap: string;
  max_amount: string;
  provider: string;
  expires_at: string | null;
  role_based: boolean;
  is_default: boolean;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  eligible_roles: any[];
  createdAt: string;
  updatedAt: string;
}

interface ViewBenefitProps {
  isOpen: boolean;
  onClose: () => void;
  benefit: Benefit | null;
}

const ViewBenefit: React.FC<ViewBenefitProps> = ({
  isOpen,
  onClose,
  benefit,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending',
      },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      SUSPENDED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Suspended',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL':
        return <i className="ri-money-dollar-circle-line text-green-600"></i>;
      case 'SERVICE':
        return <i className="ri-service-line text-blue-600"></i>;
      case 'REDEEMABLE':
        return <i className="ri-gift-line text-purple-600"></i>;
      default:
        return <i className="ri-question-line text-gray-600"></i>;
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount || amount === '0') return 'N/A';
    return formatCurrencyWithoutDecimals(amount);
  };

  const determineRateType = (rate: string, value: string) => {
    const rateNum = parseFloat(rate);
    const valueNum = parseFloat(value);

    // If rate is a reasonable percentage value (1-100), it's likely a percentage
    if (rateNum >= 1 && rateNum <= 100) {
      return 'Percentage';
    }

    // If the rate is the same as the value, it's likely a flat rate
    if (valueNum > 0 && Math.abs(rateNum - valueNum) < 1) {
      return 'Flat Rate';
    }

    // If value is very large, it's likely a flat rate
    if (valueNum > 100) {
      return 'Flat Rate';
    }

    // Default to flat rate
    return 'Flat Rate';
  };

  const formatRate = (rate: string, value: string) => {
    if (!rate || rate === '0') return 'N/A';

    // If rate is already a percentage (contains %), return as is
    if (rate.includes('%')) {
      return rate;
    }

    const rateNum = parseFloat(rate);
    if (isNaN(rateNum)) return 'N/A';

    const rateType = determineRateType(rate, value);

    if (rateType === 'Percentage') {
      return `${rateNum.toFixed(1)}%`;
    } else {
      return formatCurrency(rate);
    }
  };

  const formatCycle = (cycle: string) => {
    const cycleLabels = {
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      ANNUALLY: 'Annually',
      ONE_TIME: 'One Time',
      NONE: 'None',
    };
    return cycleLabels[cycle as keyof typeof cycleLabels] || cycle;
  };

  return (
    <Slider
      edit={false}
      title="Benefit Details"
      open={isOpen}
      setOpen={onClose}
      noPanelScroll={false}
      sliderClass="transform transition duration-500 ease-in-out"
      sliderContentClass=""
    >
      {!benefit ? (
        <div className="p-6 space-y-6 w-full max-w-4xl">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading benefit details...</div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                {getTypeIcon(benefit.type)}
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  {benefit.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {benefit.type.charAt(0) + benefit.type.slice(1).toLowerCase()}{' '}
                  • {formatCycle(benefit.cycle)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(benefit.status)}
              {benefit.is_default && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Default
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {benefit.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          )}

          {/* Main Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Benefit Information
              </h4>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Value</dt>
                  <dd className="text-lg font-medium text-gray-900 mt-1">
                    {formatCurrency(benefit.value)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rate</dt>
                  <dd className="text-lg font-medium text-gray-900 mt-1">
                    {formatRate(benefit.rate, benefit.value)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cycle</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {formatCycle(benefit.cycle)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Provider
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {benefit.provider || 'Internal'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Financial Details
              </h4>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tax Status
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        benefit.is_taxable
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {benefit.is_taxable ? 'Taxable' : 'Tax-free'}
                    </span>
                  </dd>
                </div>
                {benefit.is_taxable && benefit.tax_cap && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Tax Cap
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(benefit.tax_cap)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Salary Cap
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(benefit.salary_cap)}
                  </dd>
                </div>
                {benefit.max_amount && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Max Amount
                    </dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(benefit.max_amount)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Access Information */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Access Information
            </h4>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Access Type
                </dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      benefit.role_based
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {benefit.role_based ? 'Role-based' : 'All Roles'}
                  </span>
                </dd>
              </div>
              {benefit.role_based &&
                benefit.eligible_roles &&
                benefit.eligible_roles.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-2">
                      Eligible Roles
                    </dt>
                    <div className="flex flex-wrap gap-1">
                      {benefit.eligible_roles.map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {role.name || role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </dl>
          </div>

          {/* Dates */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">
              Important Dates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {moment(benefit.createdAt).format('MMM DD, YYYY')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Last Updated
                </dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {moment(benefit.updatedAt).format('MMM DD, YYYY')}
                </dd>
              </div>
              {benefit.expires_at ? (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expires</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {moment(benefit.expires_at).format('MMM DD, YYYY')}
                  </dd>
                </div>
              ) : (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expiry</dt>
                  <dd className="text-sm text-gray-900 mt-1">No expiry</dd>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Slider>
  );
};

export default ViewBenefit;
