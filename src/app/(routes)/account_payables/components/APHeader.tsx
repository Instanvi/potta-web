'use client';
import React from 'react';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';

interface APHeaderProps {
  totalPaid: number;
  totalBills: number;
  formatCurrency: (amount: number) => string;
}

const APHeader: React.FC<APHeaderProps> = ({
  totalPaid,
  totalBills,
  formatCurrency,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium mb-2">Accounts Payable</h1>
          <p className="text-green-100 text-lg">
            Manage vendor payments and bill processing
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6" />
            <span className="text-2xl font-medium">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-green-100">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{totalBills} bills processed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APHeader;
