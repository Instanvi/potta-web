import React from 'react';

const TableSkeleton: React.FC = () => {
  return (
    <div className="mt-10">
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="px-6 py-4 animate-pulse">
              <div className="flex items-center space-x-4">
                {/* Employee Avatar */}
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>

                {/* Employee Name */}
                <div className="h-4 bg-gray-200 rounded w-32"></div>

                {/* Today Pay */}
                <div className="h-4 bg-gray-200 rounded w-20"></div>

                {/* Rate */}
                <div className="h-4 bg-gray-200 rounded w-24"></div>

                {/* Regular Hours */}
                <div className="h-4 bg-gray-200 rounded w-16"></div>

                {/* Overtime */}
                <div className="h-4 bg-gray-200 rounded w-16"></div>

                {/* PTO Hours */}
                <div className="h-4 bg-gray-200 rounded w-16"></div>

                {/* Benefits */}
                <div className="h-4 bg-gray-200 rounded w-20"></div>

                {/* Payment Method */}
                <div className="h-4 bg-gray-200 rounded w-28"></div>

                {/* Role */}
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
