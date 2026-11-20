import React from 'react';
import { FileText, CreditCard, CheckCircle } from 'lucide-react';

interface TreasuryOverviewQuickActionsProps {
  bills: any[];
  type: 'ap' | 'ar';
}

const TreasuryOverviewQuickActions: React.FC<
  TreasuryOverviewQuickActionsProps
> = ({ bills, type }) => {
  const invoicesToVerify = bills.filter(
    (bill: any) => bill.status === 'pending_verification'
  ).length;
  const transactionsToPay = 1; // Mock data
  const entriesToPrepare = 11; // Mock data

  const content =
    type === 'ap'
      ? {
          quickAction1: 'Review Invoices',
          quickAction2: 'Process Payments',
          quickAction3: 'Journal Entries',
        }
      : {
          quickAction1: 'Send Reminders',
          quickAction2: 'Process Collections',
          quickAction3: 'Customer Management',
        };

  return (
    <div className="bg-white p-6 ">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center p-3  hover:bg-gray-50 cursor-pointer">
          <div className="w-10 h-10 bg-green-100 flex items-center justify-center mr-3">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{content.quickAction1}</p>
            <p className="text-sm text-gray-500">{invoicesToVerify} pending</p>
          </div>
        </div>
        <div className="flex items-center p-3  hover:bg-gray-50 cursor-pointer">
          <div className="w-10 h-10 bg-blue-100 flex items-center justify-center mr-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{content.quickAction2}</p>
            <p className="text-sm text-gray-500">{transactionsToPay} pending</p>
          </div>
        </div>
        <div className="flex items-center p-3  hover:bg-gray-50 cursor-pointer">
          <div className="w-10 h-10 bg-orange-100 flex items-center justify-center mr-3">
            <CheckCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{content.quickAction3}</p>
            <p className="text-sm text-gray-500">
              {entriesToPrepare} to prepare
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryOverviewQuickActions;
