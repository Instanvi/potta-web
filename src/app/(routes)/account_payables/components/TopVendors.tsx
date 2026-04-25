'use client';
import React from 'react';
import { Building2, TrendingUp } from 'lucide-react';

interface TopVendorsProps {
  data: Record<string, number>;
  formatCurrency: (amount: number) => string;
}

const TopVendors: React.FC<TopVendorsProps> = ({ data, formatCurrency }) => {
  // Sort vendors by amount (descending) and take top 5
  const topVendors = Object.entries(data)
    .map(([vendor, amount]) => ({ vendor, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const totalAmount = Object.values(data).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">Top Vendors</h2>
        <div className="p-2 bg-green-100">
          <Building2 className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="space-y-4">
        {topVendors.length > 0 ? (
          topVendors.map((vendor, index) => {
            const percentage =
              totalAmount > 0 ? (vendor.amount / totalAmount) * 100 : 0;
            const isTopVendor = index === 0;

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  isTopVendor
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isTopVendor
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isTopVendor ? 'text-green-900' : 'text-gray-900'
                      }`}
                    >
                      {vendor.vendor}
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of total payments
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      isTopVendor ? 'text-green-900' : 'text-gray-900'
                    }`}
                  >
                    {formatCurrency(vendor.amount)}
                  </p>
                  {isTopVendor && (
                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Top Vendor
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No vendor data available</p>
          </div>
        )}
      </div>

      {topVendors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total Vendor Payments</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopVendors;
