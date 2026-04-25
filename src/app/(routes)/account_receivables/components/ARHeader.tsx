'use client';
import React from 'react';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';

interface ARHeaderProps {
  totalCollected: number;
  totalInvoices: number;
  formatCurrency: (amount: number) => string;
}

const ARHeader: React.FC<ARHeaderProps> = ({
  totalCollected,
  totalInvoices,
  formatCurrency,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700  p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium mb-2">Accounts Receivable</h1>
          <p className="text-green-100 text-lg">
            Manage customer payments and collections
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6" />
            <span className="text-2xl font-medium">
              {formatCurrency(totalCollected)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-green-100">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{totalInvoices} invoices collected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARHeader;
