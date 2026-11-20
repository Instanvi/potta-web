import React from 'react';

const PayBreakdownSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200  w-32"></div>
        <div className="p-2 bg-gray-200 -lg">
          <div className="h-5 w-5 bg-gray-300 "></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-gray-50 p-4 -lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-gray-200 -lg">
                <div className="h-4 w-4 bg-gray-300 "></div>
              </div>
              <div className="h-4 bg-gray-200  w-20"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-200  w-16 mb-1"></div>
              <div className="h-4 bg-gray-200  w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayBreakdownSkeleton;
