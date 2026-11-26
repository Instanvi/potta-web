'use client';

import { Check, Percent, Gift, CreditCard, Coins } from 'lucide-react';
import { cn } from '@potta/lib/utils';

export type VoucherType = 'DISCOUNT' | 'CASHBACK' | 'GIFT_CARD' | 'ROYALTY_POINTS';
export type TabType = 'Code' | 'Policy' | 'Audience' | 'Scheduling';

interface VoucherTypeSelectorProps {
  onVoucherTypeChange?: (type: VoucherType) => void;
  selectedType?: VoucherType;
}

export default function VoucherTypeSelector({
  onVoucherTypeChange,
  selectedType = 'ROYALTY_POINTS',
}: VoucherTypeSelectorProps) {
  const voucherTypes = [
    {
      id: 'CASHBACK' as VoucherType,
      title: 'Cashback',
      description:
        'Customers get cash back they can spend in your business or any other business.',
      icon: CreditCard,
    },
    {
      id: 'ROYALTY_POINTS' as VoucherType,
      title: 'Loyalty points',
      description:
        'Customers earn points they can convert to a cash equivalent in your business.',
      icon: Coins,
    },
    {
      id: 'DISCOUNT' as VoucherType,
      title: 'Discount',
      description:
        'A fixed amount or a percentage taken off when customers shop with you.',
      icon: Percent,
    },
    {
      id: 'GIFT_CARD' as VoucherType,
      title: 'Gift card',
      description: 'A stored balance that can only be spent in your store.',
      icon: Gift,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {voucherTypes.map((type) => {
        const selected = selectedType === type.id;
        const Icon = type.icon;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onVoucherTypeChange?.(type.id)}
            className={cn(
              'relative rounded-[2px] border bg-white p-4 text-left transition-colors',
              selected
                ? 'border-primary'
                : 'border-black/[0.08] hover:border-black/20',
            )}
          >
            {selected ? (
              <span className="absolute right-3 top-3 inline-flex size-5 items-center justify-center rounded-full bg-primary text-white">
                <Check className="size-3" />
              </span>
            ) : null}
            <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[2px] bg-zinc-50 text-foreground">
              <Icon className="size-4" />
            </span>
            <span className="block text-sm font-medium text-foreground">{type.title}</span>
            <span className="mt-1 block text-sm text-muted-foreground">{type.description}</span>
          </button>
        );
      })}
    </div>
  );
}
