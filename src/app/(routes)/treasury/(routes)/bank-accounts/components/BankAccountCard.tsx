import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@potta/components/card';
import { EllipsisVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { useRouter } from 'next/navigation';

export interface BankAccountCardProps {
  bankName?: string;
  last4?: string;
  balance: number | string;
  currency?: string;
  id?: string;
  accountType?: string;
  cardType?: string;
  accountName?: string;
  onViewDetails?: object;
  onDelete?: (id: string) => void;
}

export const formatCurrency = (
  amount: string | number,
  currencyCode: string = 'XAF'
) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const typeLabels: Record<string, string> = {
  Bank_Account: 'Bank Account',
  Cash_on_Hand: 'Cash on Hand',
  Debit_Card: 'Debit Card',
  Credit_Card: 'Credit Card',
};

const BankAccountCard: React.FC<BankAccountCardProps> = ({
  bankName,
  last4,
  balance,
  currency = 'XAF',
  id,
  accountType,
  cardType,
  accountName,
  onViewDetails,
  onDelete,
}) => {
  const router = useRouter();
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      router.push(`/treasury/bank-accounts/${id || last4}`);
    }
  };

  let mainLabel = '';
  let subLabel = '';
  if (accountType === 'Bank_Account') {
    mainLabel = bankName || 'N/A';
    subLabel = last4 ? `•••• ${last4}` : '';
  } else if (accountType === 'Debit_Card' || accountType === 'Credit_Card') {
    mainLabel = cardType || 'Card';
    subLabel = last4 ? `•••• ${last4}` : '';
  } else if (accountType === 'Cash_on_Hand') {
    mainLabel = accountName || 'Cash on Hand';
    subLabel = '';
  } else {
    mainLabel = bankName || accountName || 'N/A';
    subLabel = last4 ? `•••• ${last4}` : '';
  }

  return (
    <>
      <div
        className="relative cursor-pointer group"
        // onClick={handleCardClick}
        tabIndex={0}
        role="button"
      >
        <Card className="bg-white shadow-sm hover:shadow-sm transition-shadow duration-200 relative overflow-hidden">
          <CardHeader className="pb-4 !p-4 flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                {mainLabel}
                {subLabel && (
                  <span className="ml-2 text-gray-400 text-base">
                    {subLabel}
                  </span>
                )}
              </CardTitle>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-[#F3FBFB] text-gray-700">
                {typeLabels[accountType || ''] || 'Account'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical className="cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCardClick();
                  }}
                >
                  View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    if (onDelete && id) onDelete(id);
                  }}
                >
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex flex-col items-end justify-end pt-6 pb-2">
            <span className="text-xs text-gray-500 mb-1">Balance</span>
            <span className="text-2xl font-medium text-gray-800">
              {formatCurrency(balance, currency)} {currency}
            </span>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BankAccountCard;
