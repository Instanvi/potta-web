'use client';
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface CashBalanceCardProps {
  currentBalance: number;
  projectedEndBalance?: number;
  netCashFlow: number;
  totalInflow: number;
  totalOutflow: number;
}

const CashBalanceCard: React.FC<CashBalanceCardProps> = ({
  currentBalance,
  projectedEndBalance,
  netCashFlow,
  totalInflow,
  totalOutflow,
}) => {
  const formatCurrency = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';

    if (absAmount > 0) {
      return `${sign}XAF ${absAmount.toLocaleString()}`;
    } else {
      return `XAF 0`;
    }
  };

  const formatLargeCurrency = (amount: number): string => {
    if (amount > 0) {
      return `XAF ${amount.toLocaleString()}`;
    } else {
      return `XAF 0`;
    }
  };

  const isPositive = currentBalance >= 0;
  const cashFlowTrend = netCashFlow >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main cash balance card */}
      <div
        className={`lg:col-span-2 p-6 border-2 ${
          isPositive
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign
                className={`h-6 w-6 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              />
              <h3 className="text-lg font-medium text-gray-700">
                Cash Balance
              </h3>
            </div>
            <div
              className={`text-4xl font-medium ${
                isPositive ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Current cash balance</p>
          </div>
          <div className={`p-3`}>
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-700" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-700" />
            )}
          </div>
        </div>
      </div>

      {/* Net cash flow card */}
      <div className="bg-white p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          {cashFlowTrend ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
          <h3 className="text-sm font-medium text-gray-700">Net Cash Flow</h3>
        </div>
        <div
          className={`text-2xl font-medium ${
            cashFlowTrend ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(netCashFlow)}
        </div>
        <p className="text-xs text-gray-500 mt-1">Total period flow</p>
      </div>

      {/* Cash flow breakdown */}
      <div className="bg-white p-6 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Cash Flow Breakdown
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Inflow</span>
            </div>
            <span className="text-sm font-medium text-green-600">
              {formatLargeCurrency(totalInflow)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Outflow</span>
            </div>
            <span className="text-sm font-medium text-red-600">
              {formatLargeCurrency(totalOutflow)}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Net</span>
              <span
                className={`text-sm font-medium ${
                  netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(netCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashBalanceCard;
