'use client';
import React from 'react';
import { CreditCard, Smartphone, Banknote, Wallet } from 'lucide-react';
import Image from 'next/image';

interface VendorBreakdownProps {
  data: Record<string, number>;
  formatCurrency: (amount: number) => string;
}

const VendorBreakdown: React.FC<VendorBreakdownProps> = ({
  data,
  formatCurrency,
}) => {
  // Dynamic payment method mapping with icons
  const getPaymentMethodInfo = (method: string) => {
    // Icon mapping for common payment methods
    const iconMap: Record<string, string> = {
      BANK_TRANSFER: '/icons/bank.svg',
      MOBILE_MONEY: '/icons/mtn.svg',
      MTN_MOBILE_MONEY: '/icons/mtn.svg',
      ORANGE_MONEY: '/icons/om.svg',
      CASH: '/icons/cash.svg',
      CREDIT_CARD: '/icons/credit-card.svg',
      CREDIT: '/icons/credit.svg',
      ACH_TRANSFER: '/icons/bank.svg',
      mtn: '/icons/mtn.svg',
      orange: '/icons/om.svg',
    };

    // Convert method to readable label dynamically
    const label = method
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      icon: iconMap[method] || '/icons/payment.svg',
      label: label,
    };
  };

  // Sort data by amount (descending)
  const sortedData = Object.entries(data)
    .map(([method, amount]) => ({ method, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // Top 5 payment methods

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Payment by Method
        </h2>
        <div className="green-100">
          <CreditCard className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="space-y-3">
        {sortedData.length > 0 ? (
          sortedData.map((item, index) => {
            const paymentInfo = getPaymentMethodInfo(item.method);
            const totalAmount = Object.values(data).reduce((a, b) => a + b, 0);
            const percentage =
              totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-white shadow-sm overflow-hidden">
                    <Image
                      src={paymentInfo.icon}
                      alt={paymentInfo.label}
                      width={24}
                      height={24}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        // Fallback to text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="text-xs font-medium text-gray-500 hidden">
                      {paymentInfo.label.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {paymentInfo.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No payment data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorBreakdown;
