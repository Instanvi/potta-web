import React from 'react';
import moment from 'moment';
import { PTOPolicy } from '../hooks/useFetchPTOPolicies';

interface PTOCardProps {
  pto: PTOPolicy;
  onClick: (ptoId: string) => void;
}

const PTOCard: React.FC<PTOCardProps> = ({ pto, onClick }) => {
  // Helper function to get a friendly name for PTO types
  const getPTOTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      VACATION: 'Paid Time Off',
      SICK: 'Sick Time Off',
      MATERNITY: 'Maternity Leave',
      PATERNITY: 'Paternity Leave',
      CUSTOM: 'Custom Leave',
    };
    return typeMap[type] || type;
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VACATION':
        return <i className="ri-sun-line text-orange-500"></i>;
      case 'SICK':
        return <i className="ri-heart-pulse-line text-red-500"></i>;
      case 'MATERNITY':
        return <i className="ri-women-line text-pink-500"></i>;
      case 'PATERNITY':
        return <i className="ri-user-heart-line text-blue-500"></i>;
      case 'CUSTOM':
        return <i className="ri-calendar-event-line text-purple-500"></i>;
      default:
        return <i className="ri-calendar-line text-gray-500"></i>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      EXPIRED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
      SUSPENDED: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Suspended',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.INACTIVE;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Format days value
  const formatDaysValue = (days: string): string => {
    const daysNum = parseFloat(days);
    if (daysNum === 0) return '0 days';
    if (daysNum < 1) {
      return `${Math.round(daysNum * 8)}hrs`;
    } else if (daysNum >= 30) {
      const months = Math.floor(daysNum / 30);
      return `${months} Month${months > 1 ? 's' : ''}`;
    }
    return `${daysNum} days`;
  };

  return (
    <div
      className="bg-white border border-gray-200  p-6 cursor-pointer hover:shadow-sm transition-all duration-200 group"
      onClick={() => onClick(pto.uuid)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            {getTypeIcon(pto.type)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              {getPTOTypeName(pto.type)}
            </h3>
            <p className="text-xs text-gray-500">PTO Policy</p>
          </div>
        </div>
        {getStatusBadge(pto.status)}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Days Remaining - Large Display */}
        <div className="text-center py-3">
          <div className="text-3xl font-medium text-gray-900 mb-1">
            {formatDaysValue(pto.days_remaining)}
          </div>
          <p className="text-xs text-gray-500">Days Remaining</p>
        </div>

        {/* Total Entitled Days */}
        <div className="text-center">
          <p className="text-xs text-gray-500">Total Entitled</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDaysValue(pto.total_entitled_days)}
          </p>
        </div>
      </div>

    </div>
  );
};

export default PTOCard;
