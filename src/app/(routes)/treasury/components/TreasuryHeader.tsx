'use client';
import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface TreasuryHeaderProps {
  totalCash: number;
  formatCurrency: (amount: number) => string;
}

const TreasuryHeader: React.FC<TreasuryHeaderProps> = ({
  totalCash,
  formatCurrency,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium mb-2">Treasury Management</h1>
          <p className="text-green-100 text-lg">
            Comprehensive financial management and cash flow monitoring
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6" />
            <span className="text-2xl font-medium">
              {formatCurrency(totalCash)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-green-100">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Total Cash Position</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryHeader;
