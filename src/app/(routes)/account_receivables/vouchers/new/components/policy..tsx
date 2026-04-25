'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VoucherType } from './left';
import { AlertCircle } from 'lucide-react';
import CurrencyInput from '../../../../../../components/currencyInput';

type ValueType = 'fixed' | 'proportional';

interface PolicyProps {
  voucherType: VoucherType;
  onValueTypeChange?: (type: ValueType) => void;
}

const Policy: React.FC<PolicyProps> = ({ voucherType, onValueTypeChange }) => {
  const {
    register,
    watch,
    setValue,
    unregister,
    getValues,
    formState: { errors },
  } = useFormContext();
  const valueType = (watch('valueType') as ValueType) || 'fixed';
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Watch for policy fields based on voucher type and value type
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

  // Set default value type if not set
  useEffect(() => {
    if (!valueType) {
      setValue('valueType', 'fixed');
    }

    // Set the type field instead of voucherType to avoid API error
    // This ensures we're using the correct enum value expected by the API
    switch (voucherType) {
      case 'DISCOUNT':
        setValue('type', 'DISCOUNT');
        break;
      case 'GIFT_CARD':
        setValue('type', 'GIFT_CARD');
        break;
      case 'ROYALTY_POINTS':
        setValue('type', 'ROYALTY_POINTS');
        break;
      case 'CASHBACK':
        setValue('type', 'CASHBACK');
        break;
    }

    // If switching to gift card, force fixed value type
    if (voucherType === 'GIFT_CARD') {
      setValue('valueType', 'fixed');
    }
  }, [voucherType, valueType, setValue]);

  // Reactive validation
  useEffect(() => {
    const errors: string[] = [];

    if (voucherType === 'DISCOUNT') {
      if (valueType === 'fixed' && !discountAmount) {
        errors.push('Fixed discount amount is required');
      } else if (valueType === 'proportional' && !discountPercent) {
        errors.push('Discount percentage is required');
      }
    } else if (voucherType === 'CASHBACK') {
      if (valueType === 'fixed' && !cashbackAmount) {
        errors.push('Fixed cashback percentage is required');
      } else if (valueType === 'proportional') {
        if (!cashbackAmount) errors.push('Cashback amount is required');
        if (!cashbackPercent) errors.push('Cashback percentage is required');
      }
    } else if (voucherType === 'GIFT_CARD') {
      if (!balance) {
        errors.push('Gift card value is required');
      }
    } else if (voucherType === 'ROYALTY_POINTS') {
      if (valueType === 'fixed' && !loyaltyPoints) {
        errors.push('Points value is required');
      } else if (valueType === 'proportional') {
        if (!loyaltyAmount) errors.push('Loyalty amount is required');
        if (!loyaltyPointsValue) errors.push('Points value is required');
      }
    }

    setValidationErrors(errors);
  }, [
    voucherType,
    valueType,
    discountAmount,
    discountPercent,
    cashbackAmount,
    cashbackPercent,
    balance,
    loyaltyPoints,
    loyaltyAmount,
    loyaltyPointsValue,
  ]);

  // Validate the policy tab
  const validatePolicyTab = () => {
    // Return true if there are no validation errors
    return validationErrors.length === 0;
  };

  // Add a hidden validation button that can be triggered from the parent
  useEffect(() => {
    // Create a hidden button for validation
    const validateButton = document.createElement('button');
    validateButton.id = 'validate-policy';
    validateButton.style.display = 'none';
    validateButton.onclick = () => validatePolicyTab();

    document.body.appendChild(validateButton);

    return () => {
      if (document.body.contains(validateButton)) {
        document.body.removeChild(validateButton);
      }
    };
  }, [validationErrors]);

  // Handle value type change
  const handleValueTypeChange = (type: ValueType) => {
    setValue('valueType', type);
    onValueTypeChange?.(type);

    // Clear fields when switching between fixed and proportional
    if (type === 'fixed') {
      // Unregister proportional fields
      unregister('cashbackPercent');
      unregister('discountPercent');
      unregister('loyaltyPointsValue');
      unregister('loyaltyAmount');
    } else {
      // Unregister fixed fields
      unregister('discountAmount');
      unregister('loyaltyPoints');
      if (voucherType === 'CASHBACK') {
        // For cashback, we keep cashbackAmount in both modes but with different meanings
        // So we don't unregister it
      }
    }
  };

  // Handle currency input changes
  const handleMinimumPurchaseChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue('minimumPurchase', e.target.value);
  };

  const handleMaximumDiscountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue('maximumDiscount', e.target.value);
  };

  return (
    <div className="bg-white">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-8">Policy Settings</h3>

        {/* Validation Error Messages */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h4 className="text-red-600 font-medium">
                Please fix the following errors:
              </h4>
            </div>
            <ul className="list-disc pl-5 text-red-500 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index} className="policy-error">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Value Type Selection (Fixed or Proportional) */}
        {voucherType === 'GIFT_CARD' ? (
          <div className="mb-6">
            <div className="flex w-1/2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => handleValueTypeChange('fixed')}
                className={`px-4 py-2 w-1/2 ${
                  valueType === 'fixed'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500'
                }`}
              >
                Fixed
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex w-1/2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => handleValueTypeChange('fixed')}
                className={`px-4 py-2 w-1/2 ${
                  valueType === 'fixed'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500'
                }`}
              >
                Fixed
              </button>
              <button
                type="button"
                onClick={() => handleValueTypeChange('proportional')}
                className={`px-4 py-2 w-1/2 ${
                  valueType === 'proportional'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-500'
                }`}
              >
                Proportional
              </button>
            </div>
          </div>
        )}

        {/* Discount Policy */}
        {voucherType === 'DISCOUNT' && (
          <div className="mb-6 w-1/2">
            {valueType === 'fixed' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Discount Amount{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('discountAmount')}
                      className={`border ${
                        !discountAmount ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="Enter amount"
                    />
                    <span className="ml-2 text-gray-500">XAF</span>
                  </div>
                  {!discountAmount && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('discountPercent')}
                      className={`border ${
                        !discountPercent ? 'border-red-300' : 'border-gray-300'
                      } w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="Enter percentage"
                      min={0}
                      max={100}
                    />
                    <span className="ml-2 text-gray-500">%</span>
                  </div>
                  {!discountPercent && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cashback Policy */}
        {voucherType === 'CASHBACK' && (
          <div className="mb-6 w-1/2">
            {valueType === 'fixed' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Cashback Percentage{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('cashbackAmount')}
                      className={`border ${
                        !cashbackAmount ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="Enter amount"
                    />
                    <span className="ml-2 text-gray-500">%</span>
                  </div>
                  {!cashbackAmount && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    For every <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('cashbackAmount')}
                      className={`border ${
                        !cashbackAmount ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="1000"
                    />
                    <span className="ml-2 text-gray-500">XAF</span>
                  </div>
                  {!cashbackAmount && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cashback Percentage <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('cashbackPercent')}
                      className={`border ${
                        !cashbackPercent ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      min={0}
                      max={100}
                      placeholder="100"
                    />
                    <span className="ml-2 text-gray-500">%</span>
                  </div>
                  {!cashbackPercent && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gift Card Policy */}
        {voucherType === 'GIFT_CARD' && (
          <div className="mb-6 w-1/2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gift Card Value <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  {...register('balance')}
                  className={`border ${
                    !balance ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                  placeholder="Enter amount"
                />
                <span className="ml-2 text-gray-500">XAF</span>
              </div>
              {!balance && (
                <p className="mt-1 text-sm text-red-500">Required</p>
              )}
            </div>
          </div>
        )}

        {/* Loyalty Points Policy */}
        {voucherType === 'ROYALTY_POINTS' && (
          <div className="mb-6 w-1/2">
            {valueType === 'fixed' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('loyaltyPoints')}
                      className={`border ${
                        !loyaltyPoints ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="10"
                    />
                  </div>
                  {!loyaltyPoints && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    For every <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('loyaltyAmount')}
                      className={`border ${
                        !loyaltyAmount ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="1000"
                    />
                    <span className="ml-2 text-gray-500">XAF</span>
                  </div>
                  {!loyaltyAmount && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      {...register('loyaltyPointsValue')}
                      className={`border ${
                        !loyaltyPointsValue
                          ? 'border-red-300'
                          : 'border-gray-300'
                      } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                      placeholder="1"
                    />
                  </div>
                  {!loyaltyPointsValue && (
                    <p className="mt-1 text-sm text-red-500">Required</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Policy Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Additional Settings</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="mb-4">
              <CurrencyInput
                label="Minimum Purchase Amount"
                value={minimumPurchase}
                onChange={handleMinimumPurchaseChange}
                currency="XAF"
                placeholder="0"
                info="Minimum purchase amount required to use this voucher"
              />
            </div>

            <div className="mb-4">
              <CurrencyInput
                label="Maximum Discount Amount"
                value={maximumDiscount}
                onChange={handleMaximumDiscountChange}
                currency="XAF"
                placeholder="No limit"
                info="Maximum discount amount that can be applied"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policy;
