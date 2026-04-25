'use client';
import React from 'react';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Bill {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  status: string;
  riskSeverity?: string;
  riskDecision?: string;
}

interface RecentBillsProps {
  bills: Bill[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

const RecentBills: React.FC<RecentBillsProps> = ({
  bills,
  formatCurrency,
  formatDate,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">Recent Bills</h2>
        <div className="p-2 bg-green-100">
          <FileText className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="space-y-4">
        {bills.length > 0 ? (
          bills.map((bill, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(bill.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {bill.vendor}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bill.id} • {formatDate(bill.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(bill.amount)}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    bill.status
                  )}`}
                >
                  {bill.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No recent bills available</p>
          </div>
        )}
      </div>

      {bills.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium">
            View All Bills
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentBills;
