'use client';
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface CashFlowData {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  cashFlowPercentage: number;
}

interface CashFlowSummaryProps {
  data: CashFlowData;
  formatCurrency: (amount: number) => string;
}

const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({
  data,
  formatCurrency,
}) => {
  const { cashIn, cashOut, netCashFlow, cashFlowPercentage } = data;

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Cash Flow Summary
        </h2>
        <div className="p-2 bg-green-100">
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cash In</p>
              <p className="text-lg font-medium text-gray-900">
                {formatCurrency(cashIn)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2">
              <ArrowDown className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Out</p>
              <p className="text-lg font-medium text-gray-900">
                {formatCurrency(cashOut)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2">
              {netCashFlow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
              <p
                className={`text-lg font-medium ${
                  netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(netCashFlow)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Flow %</p>
              <p className="text-lg font-medium text-gray-900">
                {cashFlowPercentage}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowSummary;
