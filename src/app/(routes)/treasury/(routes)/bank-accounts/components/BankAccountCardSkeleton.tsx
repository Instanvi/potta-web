import React from 'react';

const BankAccountCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      {/* Bank Name */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>

      {/* Account Number */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-28"></div>
      </div>

      {/* Account Type */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
};

export default BankAccountCardSkeleton;
