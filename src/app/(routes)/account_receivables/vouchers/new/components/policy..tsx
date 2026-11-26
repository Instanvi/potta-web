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
  const cashbackAmount = watch('cashbackAmount');
  const cashbackPercent = watch('cashbackPercent');
  const balance = watch('balance');
  const loyaltyPoints = watch('loyaltyPoints');
  const loyaltyAmount = watch('loyaltyAmount');
  const loyaltyPointsValue = watch('loyaltyPointsValue');
  const minimumPurchase = watch('minimumPurchase');
  const maximumDiscount = watch('maximumDiscount');

  useEffect(() => {
    if (!getValues('valueType')) setValue('valueType', 'fixed');
    setValue('type', voucherType);
    if (voucherType === 'GIFT_CARD') setValue('valueType', 'fixed');
  }, [voucherType, setValue, getValues]);

  const handleValueTypeChange = (type: ValueType) => {
    setValue('valueType', type);
    onValueTypeChange?.(type);
    if (type === 'fixed') {
      unregister('cashbackPercent');
      unregister('discountPercent');
      unregister('loyaltyPointsValue');
      unregister('loyaltyAmount');
    } else {
      unregister('discountAmount');
      unregister('loyaltyPoints');
    }
  };

  const missing = (value: unknown) => (showErrors && !value ? 'Required' : undefined);

  return (
    <div className="space-y-6">
      {voucherType !== 'GIFT_CARD' ? (
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
              label="Fixed discount amount (XAF)"
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

        {voucherType === 'CASHBACK' && valueType === 'fixed' ? (
          <div className={missing(cashbackAmount) ? 'error-field' : ''}>
            <Input
              type="number"
              label="Fixed cashback percentage"
              name="cashbackAmount"
              required
              register={register}
              placeholder="Enter amount"
              errors={missing(cashbackAmount)}
            />
          </div>
        ) : null}

        {voucherType === 'CASHBACK' && valueType === 'proportional' ? (
          <>
            <div className={missing(cashbackAmount) ? 'error-field' : ''}>
              <Input
                type="number"
                label="For every (XAF)"
                name="cashbackAmount"
                required
                register={register}
                placeholder="1000"
                errors={missing(cashbackAmount)}
              />
            </div>
            <div className={missing(cashbackPercent) ? 'error-field' : ''}>
              <Input
                type="number"
                label="Cashback percentage"
                name="cashbackPercent"
                required
                min={0}
                max={100}
                register={register}
                placeholder="100"
                errors={missing(cashbackPercent)}
              />
            </div>
          </>
        ) : null}

        {voucherType === 'GIFT_CARD' ? (
          <div className={missing(balance) ? 'error-field' : ''}>
            <Input
              type="number"
              label="Gift card value (XAF)"
              name="balance"
              required
              register={register}
              placeholder="Enter amount"
              errors={missing(balance)}
            />
          </div>
        ) : null}

        {voucherType === 'ROYALTY_POINTS' && valueType === 'fixed' ? (
          <div className={missing(loyaltyPoints) ? 'error-field' : ''}>
            <Input
              type="number"
              label="Points"
              name="loyaltyPoints"
              required
              register={register}
              placeholder="10"
              errors={missing(loyaltyPoints)}
            />
          </div>
        ) : null}

        {voucherType === 'ROYALTY_POINTS' && valueType === 'proportional' ? (
          <>
            <div className={missing(loyaltyAmount) ? 'error-field' : ''}>
              <Input
                type="number"
                label="For every (XAF)"
                name="loyaltyAmount"
                required
                register={register}
                placeholder="1000"
                errors={missing(loyaltyAmount)}
              />
            </div>
            <div className={missing(loyaltyPointsValue) ? 'error-field' : ''}>
              <Input
                type="number"
                label="Points"
                name="loyaltyPointsValue"
                required
                register={register}
                placeholder="1"
                errors={missing(loyaltyPointsValue)}
              />
            </div>
          </>
        ) : null}

        <Input
          type="text"
          label="Minimum purchase amount (XAF)"
          name="minimumPurchase"
          value={minimumPurchase ?? ''}
          onchange={(e) => setValue('minimumPurchase', e.target.value)}
          placeholder="0"
        />
        <div
          className={
            showErrors && validationErrorsMessage(minimumPurchase, maximumDiscount)
              ? 'error-field'
              : ''
          }
        >
          <Input
            type="text"
            label="Maximum discount amount (XAF)"
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
        </div>
      </div>
    </div>
  );
};

function validationErrorsMessage(minimumPurchase?: string, maximumDiscount?: string) {
  if (!minimumPurchase || !maximumDiscount) return undefined;
  const minPurchase = parseFloat(minimumPurchase);
  const maxDiscount = parseFloat(maximumDiscount);
  if (!isNaN(minPurchase) && !isNaN(maxDiscount) && maxDiscount > minPurchase) {
    return 'Maximum discount cannot be greater than minimum purchase amount';
  }
  return undefined;
}

export default Policy;
