'use client';
import React from 'react';
import { DollarSign, FileText, TrendingUp, Users } from 'lucide-react';

interface CollectionSummaryProps {
  data: {
    totalCollected: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    collectionRate: number;
  };
  formatCurrency: (amount: number) => string;
}

const CollectionSummary: React.FC<CollectionSummaryProps> = ({
  data,
  formatCurrency,
}) => {
  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900 ">
          Collection Summary
        </h2>
        <div className="p-2 bg-green-100">
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 ">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 ">
                Total Collected
              </p>
              <p className="text-lg font-medium text-gray-900 ">
                {formatCurrency(data.totalCollected)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Invoices
              </p>
              <p className="text-lg font-medium text-gray-900">
                {data.totalInvoices}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="purple-100">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Invoice Value
              </p>
              <p className="text-lg font-medium text-gray-900">
                {formatCurrency(data.averageInvoiceValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="orange-100">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Collection Rate
              </p>
              <p className="text-lg font-medium text-gray-900">
                {data.collectionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionSummary;
