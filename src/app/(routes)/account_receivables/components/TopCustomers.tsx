'use client';
import React from 'react';
import { Users } from 'lucide-react';

interface TopCustomersProps {
  data: Record<string, number>;
  formatCurrency: (amount: number) => string;
}

const TopCustomers: React.FC<TopCustomersProps> = ({
  data,
  formatCurrency,
}) => {
  // Sort data by amount (descending) and take top 5
  const topCustomers = Object.entries(data)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Top Revenue Sources
        </h2>
        <button
          onClick={() => (window.location.href = '/customers')}
          className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
        >
          View All Customers
        </button>
      </div>

      <div className="space-y-3">
        {topCustomers.length > 0 ? (
          topCustomers.map((customer, index) => {
            const totalAmount = Object.values(data).reduce((a, b) => a + b, 0);
            const percentage =
              totalAmount > 0 ? (customer.amount / totalAmount) * 100 : 0;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <span className="text-sm font-medium text-green-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of total revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(customer.amount)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No customer data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCustomers;
