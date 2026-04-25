'use client';

import { Check, Percent, Gift, CreditCard, Coins } from 'lucide-react';
import { Card, CardContent } from '@potta/components/card';

export type VoucherType = 'DISCOUNT' | 'CASHBACK' | 'GIFT_CARD' | 'ROYALTY_POINTS';
export type TabType = 'Code' |'Policy' | 'Audience' | 'Scheduling';

interface VoucherTypeSelectorProps {
  onVoucherTypeChange?: (type: VoucherType) => void;
  selectedType?: VoucherType;
}

export default function VoucherTypeSelector({ 
  onVoucherTypeChange, 
  selectedType = 'ROYALTY_POINTS'
}: VoucherTypeSelectorProps) {
  
  const voucherTypes = [
    {
      id: 'CASHBACK' as VoucherType,
      title: 'Cash backs',
      description: 'Customers get actual cashback which can be spent in your business or any other business',
      icon: <CreditCard className="h-6 w-6 text-gray-500" />
    },
    {
      id: 'ROYALTY_POINTS' as VoucherType,
      title: 'Loyalty Points',
      description: 'Customers get redeemable points which can be converted to cash equivalent on your business',
      icon: <Coins className="h-6 w-6 text-gray-500" />
    },
    {
      id: 'DISCOUNT' as VoucherType,
      title: 'Discounts',
      description: 'These are flat rate or percentage discounts applied when shopping in your business',
      icon: <Percent className="h-6 w-6 text-gray-500" />
    },
    {
      id: 'GIFT_CARD' as VoucherType,
      title: 'Gift cards',
      description: 'Enhance loyalty to your brand by offering gift cards which can only be spent in your store',
      icon: <Gift className="h-6 w-6 text-gray-500" />
    }
  ];

  const handleTypeSelect = (type: VoucherType) => {
    onVoucherTypeChange?.(type);
  };

  return (
    <div className="bg-white ">
      <div className="p-4">
        <h3 className="text-xl font-medium mb-4">Select Voucher Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 gap-y-10 w-[80%] justify-center">
          {voucherTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer border relative ${selectedType === type.id ? 'border-green-500' : 'border-gray-200'} relative]  hover:border-green-500 transition-all duration-200 ease-in-out`}
              onClick={() => handleTypeSelect(type.id)}
            >
              {selectedType === type.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-full p-2 w-10 h-10 flex items-center justify-center mb-4">
                  {type.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{type.title}</h3>
                <p className="text-gray-600 text-base w-[95%]">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}