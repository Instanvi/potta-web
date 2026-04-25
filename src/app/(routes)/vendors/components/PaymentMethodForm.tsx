'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreatePaymentMethodPayload, PaymentMethodType } from '../utils/types';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import Button from '@potta/components/button';
import Modal from '@potta/components/modal';

interface PaymentMethodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentMethodPayload) => void;
  initialData?: CreatePaymentMethodPayload;
  isEditing?: boolean;
}

const paymentMethodSchema = yup.object().shape({
  paymentMethodType: yup
    .string()
    .oneOf(
      [
        'CREDIT_CARD',
        'BANK_TRANSFER',
        'ACH_TRANSFER',
        'MOBILE_MONEY',
        'DIGITAL_WALLET',
        'CASH',
        'CREDIT',
        'OTHER',
      ],
      'Invalid payment method type'
    )
    .required('Payment method type is required'),
  accountName: yup.string().when('paymentMethodType', {
    is: (val: string) => val !== 'MOBILE_MONEY',
    then: (schema) => schema.required('Account name is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  accountNumber: yup.string().when('paymentMethodType', {
    is: (val: string) =>
      ['BANK_TRANSFER', 'ACH_TRANSFER', 'CREDIT_CARD', 'CREDIT'].includes(val),
    then: (schema) =>
      schema.required('Account number is required for this payment type'),
    otherwise: (schema) => schema.nullable(),
  }),
  bankName: yup.string().when('paymentMethodType', {
    is: (val: string) => ['BANK_TRANSFER', 'ACH_TRANSFER'].includes(val),
    then: (schema) =>
      schema.required('Bank name is required for bank transfers'),
    otherwise: (schema) => schema.nullable(),
  }),
  phoneNumber: yup.string().when('paymentMethodType', {
    is: 'MOBILE_MONEY',
    then: (schema) =>
      schema.required('Phone number is required for mobile money'),
    otherwise: (schema) => schema.nullable(),
  }),
  walletId: yup.string().when('paymentMethodType', {
    is: 'DIGITAL_WALLET',
    then: (schema) =>
      schema.required('Wallet ID is required for digital wallet'),
    otherwise: (schema) => schema.nullable(),
  }),
  dailyLimit: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Daily limit must be positive'),
  monthlyLimit: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Monthly limit must be positive'),
  isPrimary: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  notes: yup.string().nullable(),
});

const PaymentMethodTypeEnum = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ACH_TRANSFER', label: 'ACH Transfer' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'DIGITAL_WALLET', label: 'Digital Wallet' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'OTHER', label: 'Other' },
];

const CardTypeEnum = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'AMEX', label: 'American Express' },
  { value: 'DISCOVER', label: 'Discover' },
  { value: 'OTHER', label: 'Other' },
];

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [selectedType, setSelectedType] =
    useState<PaymentMethodType>('BANK_TRANSFER');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreatePaymentMethodPayload>({
    resolver: yupResolver(paymentMethodSchema) as any,
    defaultValues: {
      paymentMethodType: 'BANK_TRANSFER',
      accountName: '',
      accountNumber: '',
      bankName: '',
      bankCode: '',
      swiftCode: '',
      iban: '',
      phoneNumber: '',
      walletId: '',
      cardNumber: '',
      cardType: '',
      dailyLimit: 0,
      monthlyLimit: 0,
      isPrimary: false,
      isActive: true,
      notes: '',
    },
  });

  const watchedType = watch('paymentMethodType');

  useEffect(() => {
    if (watchedType) {
      setSelectedType(watchedType as PaymentMethodType);
    }
  }, [watchedType]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedType(initialData.paymentMethodType);
    } else {
      reset({
        paymentMethodType: 'BANK_TRANSFER',
        accountName: '',
        accountNumber: '',
        bankName: '',
        bankCode: '',
        swiftCode: '',
        iban: '',
        phoneNumber: '',
        walletId: '',
        cardNumber: '',
        cardType: '',
        dailyLimit: 0,
        monthlyLimit: 0,
        isPrimary: false,
        isActive: true,
        notes: '',
      });
      setSelectedType('BANK_TRANSFER');
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data: CreatePaymentMethodPayload) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'BANK_TRANSFER':
      case 'ACH_TRANSFER':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Account Number"
                type="text"
                name="accountNumber"
                placeholder="Enter account number"
                register={register}
                errors={errors.accountNumber}
                required
              />
              <Input
                label="Bank Name"
                type="text"
                name="bankName"
                placeholder="Enter bank name"
                register={register}
                errors={errors.bankName}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bank Code"
                type="text"
                name="bankCode"
                placeholder="Enter bank code (optional)"
                register={register}
                errors={errors.bankCode}
              />
              {selectedType === 'BANK_TRANSFER' && (
                <Input
                  label="SWIFT Code"
                  type="text"
                  name="swiftCode"
                  placeholder="Enter SWIFT code (optional)"
                  register={register}
                  errors={errors.swiftCode}
                />
              )}
              {selectedType === 'ACH_TRANSFER' && (
                <Input
                  label="Routing Number"
                  type="text"
                  name="swiftCode"
                  placeholder="Enter routing number (optional)"
                  register={register}
                  errors={errors.swiftCode}
                />
              )}
            </div>
            {selectedType === 'BANK_TRANSFER' && (
              <Input
                label="IBAN"
                type="text"
                name="iban"
                placeholder="Enter IBAN (optional)"
                register={register}
                errors={errors.iban}
              />
            )}
          </>
        );

      case 'MOBILE_MONEY':
        return (
          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            placeholder="+237 123 456 789"
            register={register}
            errors={errors.phoneNumber}
            required
          />
        );

      case 'CREDIT_CARD':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Card Number"
                type="text"
                name="cardNumber"
                placeholder="**** **** **** 3456"
                register={register}
                errors={errors.cardNumber}
                required
              />
              <Controller
                name="cardType"
                control={control}
                render={({ field }) => (
                  <Select
                    options={CardTypeEnum}
                    selectedValue={field.value || 'VISA'}
                    onChange={field.onChange}
                    bg="bg-white"
                    name="Select Card Type"
                    label="Card Type"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                type="text"
                name="accountNumber"
                placeholder="MM/YY"
                register={register}
                errors={errors.accountNumber}
              />
              <Input
                label="Cardholder Name"
                type="text"
                name="bankName"
                placeholder="Name on card"
                register={register}
                errors={errors.bankName}
              />
            </div>
          </>
        );

      case 'DIGITAL_WALLET':
        return (
          <>
            <Input
              label="Wallet ID / Email"
              type="text"
              name="walletId"
              placeholder="Enter wallet ID or email"
              register={register}
              errors={errors.walletId}
              required
            />
            <Input
              label="Wallet Provider"
              type="text"
              name="bankName"
              placeholder="e.g., PayPal, Skrill, Neteller"
              register={register}
              errors={errors.bankName}
            />
          </>
        );

      case 'CREDIT':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Credit Account Number"
                type="text"
                name="accountNumber"
                placeholder="Enter credit account number"
                register={register}
                errors={errors.accountNumber}
                required
              />
              <Input
                label="Credit Limit"
                type="number"
                name="monthlyLimit"
                placeholder="Enter credit limit"
                register={register}
                errors={errors.monthlyLimit}
              />
            </div>
          </>
        );

      case 'CASH':
        return (
          <div className="p-4 bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              Cash payment method does not require additional details. You can
              set daily and monthly limits below.
            </p>
          </div>
        );

      case 'OTHER':
        return (
          <Input
            label="Payment Method Details"
            type="text"
            name="notes"
            placeholder="Describe the payment method"
            register={register}
            errors={errors.notes}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={isOpen}
      setOpen={(value) => {
        if (!value) handleClose();
      }}
      title={isEditing ? 'Edit Payment Method' : 'Add Payment Method'}
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit as any)}
        className="space-y-4"
      >
        <div className={`grid ${selectedType === 'MOBILE_MONEY' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          <Controller
            name="paymentMethodType"
            control={control}
            render={({ field }) => (
              <Select
                options={PaymentMethodTypeEnum}
                selectedValue={field.value}
                onChange={field.onChange}
                bg="bg-white"
                name="Select Payment Method Type"
                label="Payment Method Type"
                required
              />
            )}
          />
          {selectedType !== 'MOBILE_MONEY' && (
            <Input
              label="Account Name"
              type="text"
              name="accountName"
              placeholder="Enter account name"
              register={register}
              errors={errors.accountName}
              required
            />
          )}
        </div>

        {renderTypeSpecificFields()}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Daily Limit"
            type="number"
            name="dailyLimit"
            placeholder="0"
            register={register}
            errors={errors.dailyLimit}
          />
          <Input
            label="Monthly Limit"
            type="number"
            name="monthlyLimit"
            placeholder="0"
            register={register}
            errors={errors.monthlyLimit}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimary"
              {...register('isPrimary')}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="isPrimary"
              className="text-sm font-medium text-gray-700"
            >
              Set as Primary Payment Method
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="rounded border-gray-300"
              defaultChecked
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Mark as Active
            </label>
          </div>
        </div>

        <Input
          label="Notes"
          type="text"
          name="notes"
          placeholder="Additional notes (optional)"
          register={register}
          errors={errors.notes}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            text="Cancel"
            theme="lightBlue"
            onClick={handleClose}
          />
          <Button
            type="submit"
            text={isEditing ? 'Update Payment Method' : 'Add Payment Method'}
            theme="default"
          />
        </div>
      </form>
    </Modal>
  );
};

export default PaymentMethodForm;
