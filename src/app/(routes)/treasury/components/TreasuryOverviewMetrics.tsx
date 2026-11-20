import React from 'react';
import {
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface TreasuryOverviewMetricsProps {
  bills: any[];
  type: 'ap' | 'ar';
}

const TreasuryOverviewMetrics: React.FC<TreasuryOverviewMetricsProps> = ({
  bills,
  type,
}) => {
  // Calculate metrics
  const invoicesToVerify = bills.filter(
    (bill: any) => bill.status === 'pending_verification'
  ).length;
  const invoicesToPay = bills.filter(
    (bill: any) => bill.status === 'pending_payment'
  ).length;
  const transactionsToPay = 1; // Mock data
  const entriesToPrepare = 11; // Mock data
  const totalToPay = bills
    .filter((bill: any) => bill.status === 'pending_payment')
    .reduce(
      (sum: number, bill: any) => sum + (parseFloat(bill.invoiceTotal) || 0),
      0
    );
  const scheduledTransactions = 0;
  const paidTransactions = 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const content =
    type === 'ap'
      ? {
          totalOutstandingLabel: 'Total Outstanding',
          scheduledLabel: 'Scheduled Payments',
          paidLabel: 'Paid This Month',
          pendingLabel: 'Pending Actions',
        }
      : {
          totalOutstandingLabel: 'Outstanding Receivables',
          scheduledLabel: 'Collections This Month',
          paidLabel: 'Collected This Month',
          pendingLabel: 'Pending Collections',
        };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Total Outstanding */}
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {content.totalOutstandingLabel}
            </p>
            <p className="text-2xl font-medium text-gray-900">
              {formatCurrency(totalToPay)}
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
          <span className="text-green-600">+12.5%</span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      {/* Scheduled Payments */}
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{content.scheduledLabel}</p>
            <p className="text-2xl font-medium text-gray-900">
              {formatCurrency(scheduledTransactions)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
          <span className="text-red-600">-5.2%</span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      {/* Paid This Month */}
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{content.paidLabel}</p>
            <p className="text-2xl font-medium text-gray-900">
              {formatCurrency(paidTransactions)}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
          <span className="text-green-600">+8.7%</span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      {/* Pending Actions */}
      <div className="bg-white p-4 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{content.pendingLabel}</p>
            <p className="text-2xl font-medium text-gray-900">
              {invoicesToPay + transactionsToPay + entriesToPrepare}
            </p>
          </div>
          <div className="w-12 h-12 bg-orange-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {invoicesToPay} invoices, {transactionsToPay} payments
        </div>
      </div>
    </div>
  );
};

export default TreasuryOverviewMetrics;
