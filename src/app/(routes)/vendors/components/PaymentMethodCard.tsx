'use client';
import React from 'react';
import { CreatePaymentMethodPayload } from '../utils/types';
import { Badge } from '@potta/components/shadcn/badge';
import { Button } from '@potta/components/shadcn/button';
import {
  Edit,
  Trash2,
  Star,
  StarOff,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Coins,
  Wallet,
} from 'lucide-react';

interface PaymentMethodCardProps {
  paymentMethod: CreatePaymentMethodPayload;
  index: number;
  isPrimary: boolean;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onSetPrimary: (index: number) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  index,
  isPrimary,
  onEdit,
  onRemove,
  onSetPrimary,
}) => {
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'BANK_TRANSFER':
        return <Building2 className="h-4 w-4" />;
      case 'MOBILE_MONEY':
        return <Smartphone className="h-4 w-4" />;
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="h-4 w-4" />;
      case 'CASH':
        return <Banknote className="h-4 w-4" />;
      case 'CRYPTOCURRENCY':
        return <Coins className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (type: string) => {
    return type
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDisplayValue = () => {
    switch (paymentMethod.paymentMethodType) {
      case 'BANK_TRANSFER':
        return paymentMethod.accountNumber
          ? `****${paymentMethod.accountNumber.slice(-4)}`
          : 'No account number';
      case 'MOBILE_MONEY':
        return paymentMethod.phoneNumber || 'No phone number';
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return paymentMethod.cardNumber
          ? `****${paymentMethod.cardNumber.slice(-4)}`
          : 'No card number';
      case 'CASH':
        return 'Cash payments';
      case 'CRYPTOCURRENCY':
        return paymentMethod.walletId
          ? `Wallet: ${paymentMethod.walletId.slice(0, 8)}...`
          : 'No wallet ID';
      default:
        return paymentMethod.accountName || 'No account name';
    }
  };

  const getSecondaryInfo = () => {
    switch (paymentMethod.paymentMethodType) {
      case 'BANK_TRANSFER':
        return paymentMethod.bankName || 'No bank name';
      case 'MOBILE_MONEY':
        return 'Mobile Money';
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return paymentMethod.cardType || 'Card';
      case 'CASH':
        return 'Physical cash';
      case 'CRYPTOCURRENCY':
        return 'Cryptocurrency';
      default:
        return paymentMethod.accountName || 'Account';
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 ${
        isPrimary ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-full ${
              isPrimary ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            {getPaymentMethodIcon(paymentMethod.paymentMethodType)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {getPaymentMethodLabel(paymentMethod.paymentMethodType)}
              </h4>
              {isPrimary && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{getDisplayValue()}</p>
            <p className="text-xs text-gray-500 mt-1">{getSecondaryInfo()}</p>
            {paymentMethod.dailyLimit && (
              <p className="text-xs text-gray-500 mt-1">
                Daily Limit: {paymentMethod.dailyLimit.toLocaleString()}
              </p>
            )}
            {paymentMethod.monthlyLimit && (
              <p className="text-xs text-gray-500">
                Monthly Limit: {paymentMethod.monthlyLimit.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isPrimary && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetPrimary(index)}
              className="text-xs"
            >
              <StarOff className="h-3 w-3 mr-1" />
              Set Primary
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(index)}
            className="text-xs"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
