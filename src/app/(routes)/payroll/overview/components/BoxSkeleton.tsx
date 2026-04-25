import React from 'react';

const BoxSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-200 rounded-lg">
            <div className="h-5 w-5 bg-gray-300 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  );
};

export default BoxSkeleton;
