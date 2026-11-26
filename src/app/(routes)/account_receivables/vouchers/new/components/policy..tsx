'use client';

import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VoucherType } from './left';
import Input from '@potta/components/input';

type ValueType = 'fixed' | 'proportional';

interface PolicyProps {
  voucherType: VoucherType;
  showErrors?: boolean;
  onValueTypeChange?: (type: ValueType) => void;
}

const Policy = ({ voucherType, showErrors = false, onValueTypeChange }: PolicyProps) => {
  const { register, watch, setValue, unregister, getValues } = useFormContext();
  const valueType = (watch('valueType') as ValueType) || 'fixed';
  const discountAmount = watch('discountAmount');
  const discountPercent = watch('discountPercent');
  const cashbackPercent = watch('cashbackPercent');
  const cashbackMaximum = watch('cashbackMaximum');
  const balance = watch('balance');
  const loyaltyPoints = watch('loyaltyPoints');
  const loyaltyAmount = watch('loyaltyAmount');
  const minimumPurchase = watch('minimumPurchase');
  const maximumDiscount = watch('maximumDiscount');

  useEffect(() => {
    if (!getValues('valueType')) setValue('valueType', 'fixed');
    setValue('type', voucherType);
    if (voucherType === 'GIFT_CARD' || voucherType === 'CASHBACK') {
      setValue('valueType', 'fixed');
    }
  }, [voucherType, setValue, getValues]);

  const handleValueTypeChange = (type: ValueType) => {
    setValue('valueType', type);
    onValueTypeChange?.(type);
    if (type === 'fixed') {
      unregister('discountPercent');
      unregister('loyaltyAmount');
    } else {
      unregister('discountAmount');
    }
  };

  const missing = (value: unknown) => (showErrors && !value && value !== 0 ? 'Required' : undefined);

  return (
    <div className="space-y-6">
      {voucherType === 'DISCOUNT' || voucherType === 'ROYALTY_POINTS' ? (
        <div>
          <span className="mb-1 block text-sm font-normal text-foreground">Value type</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['fixed', 'proportional'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleValueTypeChange(type)}
                className={`h-9 rounded-[2px] border px-3 text-sm capitalize ${
                  valueType === type
                    ? 'border-primary bg-primary text-white'
                    : 'border-black/15 bg-white text-foreground hover:bg-accent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {voucherType === 'DISCOUNT' && valueType === 'fixed' ? (
          <div className={missing(discountAmount) ? 'error-field' : ''}>
            <Input
              type="number"
              label="Fixed discount amount"
              name="discountAmount"
              required
              register={register}
              placeholder="Enter amount"
              errors={missing(discountAmount)}
            />
          </div>
        ) : null}

        {voucherType === 'DISCOUNT' && valueType === 'proportional' ? (
          <div className={missing(discountPercent) ? 'error-field' : ''}>
            <Input
              type="number"
              label="Discount percentage"
              name="discountPercent"
              required
              min={0}
              max={100}
              register={register}
              placeholder="Enter percentage"
              errors={missing(discountPercent)}
            />
          </div>
        ) : null}

        {voucherType === 'DISCOUNT' ? (
          <Input
            type="number"
            label="Maximum discount amount"
            name="maximumDiscount"
            value={maximumDiscount ?? ''}
            onchange={(e) => setValue('maximumDiscount', e.target.value)}
            placeholder="No limit"
            errors={
              showErrors
                ? validationErrorsMessage(minimumPurchase, maximumDiscount)
                : undefined
            }
          />
        ) : null}

        {voucherType === 'CASHBACK' ? (
          <>
            <div className={missing(cashbackPercent) ? 'error-field' : ''}>
              <Input
                type="number"
                label="Cashback percentage"
                name="cashbackPercent"
                required
                min={0}
                max={100}
                register={register}
                placeholder="10"
                errors={missing(cashbackPercent)}
              />
            </div>
            <div className={missing(cashbackMaximum) ? 'error-field' : ''}>
              <Input
                type="number"
                label="Maximum cashback"
                name="cashbackMaximum"
                required
                register={register}
                placeholder="5000"
                errors={missing(cashbackMaximum)}
              />
            </div>
          </>
        ) : null}

        {voucherType === 'GIFT_CARD' ? (
          <div className={missing(balance) ? 'error-field' : ''}>
            <Input
              type="number"
              label="Gift card value"
              name="balance"
              required
              register={register}
              placeholder="Enter amount"
              errors={missing(balance)}
            />
          </div>
        ) : null}

        {voucherType === 'ROYALTY_POINTS' ? (
          <>
            <div className={missing(loyaltyPoints) ? 'error-field' : ''}>
              <Input
                type="number"
                label="Points awarded"
                name="loyaltyPoints"
                required
                register={register}
                placeholder="10"
                errors={missing(loyaltyPoints)}
              />
            </div>
            {valueType === 'proportional' ? (
              <div className={missing(loyaltyAmount) ? 'error-field' : ''}>
                <Input
                  type="number"
                  label="For every (spend amount)"
                  name="loyaltyAmount"
                  required
                  register={register}
                  placeholder="1000"
                  errors={missing(loyaltyAmount)}
                />
              </div>
            ) : (
              <Input
                type="number"
                label="Spend amount (optional)"
                name="loyaltyAmount"
                register={register}
                placeholder="1000"
              />
            )}
          </>
        ) : null}

        <Input
          type="number"
          label="Minimum purchase amount"
          name="minimumPurchase"
          value={minimumPurchase ?? ''}
          onchange={(e) => setValue('minimumPurchase', e.target.value)}
          placeholder="0"
        />
      </div>
    </div>
  );
};

function validationErrorsMessage(minimumPurchase?: string, maximumDiscount?: string) {
  if (!minimumPurchase || !maximumDiscount) return undefined;
  const minPurchase = parseFloat(String(minimumPurchase));
  const maxDiscount = parseFloat(String(maximumDiscount));
  if (!isNaN(minPurchase) && !isNaN(maxDiscount) && maxDiscount > minPurchase) {
    return 'Maximum discount cannot be greater than minimum purchase amount';
  }
  return undefined;
}

export default Policy;
