'use client';
import React, { useContext, useState } from 'react';
import Input from '@potta/components/input';

import Slider from '@potta/components/slideover';
import { SingleValue } from 'react-select';
import Select from '@potta/components/select';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@potta/components/button';
import Address from './address';
import { ContextData } from '@potta/components/providers/DataProvider';
import { VendorPayload, vendorSchema } from '../utils/validations';
import Notes from './note';
import Tax from './tax';
import useCreateVendor from '../hooks/useCreateVendor';
import toast from 'react-hot-toast';
import { vendorApi } from '../utils/api';

const SliderVendor = () => {
  const [tabs, setTabs] = useState<string>('Address');
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const context = useContext(ContextData);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<VendorPayload>({
    resolver: yupResolver(vendorSchema),
    defaultValues: {
      name: '',
      type: undefined,
      contactPerson: '',
      email: '',
      phone: '',
      address: {
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        latitude: 0,
        longitude: 0,
      },
      paymentTerms: '',
      website: '',
      accountDetails: '',
      currency: undefined,
      openingBalance: 0,
      classification: undefined,
      industry: undefined,
      creditLimit: 0,
      notes: '',
      initializeKYC: false,
    },
  });

  const VendorTypeEnum = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
  ];

  const VendorClassificationEnum = [
    { value: 'Supplier', label: 'Supplier' },
    { value: 'Service Provider', label: 'Service Provider' },
  ];

  const VendorCurrencyEnum = [
    { value: 'EUR', label: 'EUR' },
    { value: 'USD', label: 'USD' },
    { value: 'XAF', label: 'XAF' },
  ];

  const VendorIndustryEnum = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Food & Beverage', label: 'Food & Beverage' },
    { value: 'Other', label: 'Other' },
  ];

  const VendorPaymentMethodEnum = [
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'CREDIT_CARD', label: 'Credit Card' },
    { value: 'DEBIT_CARD', label: 'Debit Card' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CRYPTOCURRENCY', label: 'Cryptocurrency' },
    { value: 'OTHER', label: 'Other' },
  ];
  const mutation = useCreateVendor();

  const onSubmit = async (data: VendorPayload) => {
    try {
      // Create vendor
      const { initializeKYC, ...vendorData } = data;
      const vendor = await vendorApi.create(vendorData as any);

      // Initialize KYC (optional)
      if (initializeKYC) {
        await vendorApi.kyc.initialize(vendor.uuid);
      }

      toast.success('Vendor created successfully!');
      reset();
      setIsSliderOpen(false);
    } catch (error) {
      console.error('Failed to create vendor:', error);
      toast.error('Failed to create vendor');
    }
  };
  return (
    <Slider
      open={isSliderOpen}
      setOpen={setIsSliderOpen}
      edit={false}
      title={'Create New Vendor'}
      buttonText="vendor"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-4xl pb-20"
      >
        <div className="w-full grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Vendor Name"
              type="text"
              name="name"
              placeholder="Enter vendor name"
              register={register}
              errors={errors.name}
              required
            />
          </div>
          <div>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  options={VendorTypeEnum}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="Select Vendor Type"
                  label="Type"
                  required
                />
              )}
            />
            {errors.type && (
              <small className="text-red-500">{errors.type.message}</small>
            )}
          </div>
        </div>
        <div className="w-full grid my-5 grid-cols-2 gap-3">
          <div>
            <Input
              label="Contact Name"
              type="text"
              name="contactPerson"
              placeholder="Enter Contact Name"
              register={register}
              errors={errors.contactPerson}
            />
          </div>
          <div>
            <Controller
              name="classification"
              control={control}
              render={({ field }) => (
                <Select
                  options={VendorClassificationEnum}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="Select Classification"
                  label="Classification "
                  required
                />
              )}
            />
            {errors.classification && (
              <small className="text-red-500">
                {errors.classification.message}
              </small>
            )}
          </div>
        </div>
        <div className="w-full grid my-5 grid-cols-2 gap-3">
          <div>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select
                  options={VendorIndustryEnum}
                  selectedValue={field.value || ''}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="Select Industry"
                  label="Industry"
                />
              )}
            />
            {errors.industry && (
              <small className="text-red-500">{errors.industry.message}</small>
            )}
          </div>
          <div>
            <Input
              label="Credit Limit"
              type="number"
              name="creditLimit"
              placeholder="Enter credit limit"
              register={register}
              errors={errors.creditLimit}
            />
          </div>
        </div>
        <hr />
        <div className="mt-2">
          <h1 className="text-xl">Contact Information </h1>
          <div className="w-full grid mt-7 grid-cols-2 gap-3">
            <div>
              <Input
                type="tel"
                label={'Phone Number'}
                name={'phone'}
                placeholder="(555) 123-4567"
                register={register}
                errors={errors.phone}
                required
              />
            </div>
            <div>
              <Input
                type={'text'}
                label={'Email'}
                name={'email'}
                placeholder="abcdfg@abc.com"
                register={register}
                errors={errors.email}
                required
              />
            </div>
          </div>

          <div className="w-full grid mt-4 grid-cols-1 space-y-4">
            <div>
              <Input
                type={'text'}
                label={'Website'}
                name={'website'}
                placeholder="www.example.com"
                register={register}
                errors={errors.website}
              />
            </div>
          </div>
          <div className="w-full grid mt-4 grid-cols-2 gap-3">
            <div>
              <Input
                type={'number'}
                label={'Opening Balance '}
                placeholder="00"
                name={'openingBalance'}
                register={register}
                errors={errors.openingBalance}
              />
            </div>
            <div>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    options={VendorCurrencyEnum}
                    selectedValue={field.value}
                    onChange={field.onChange}
                    bg="bg-white"
                    name="Select Currency"
                    label="Currency "
                    required
                  />
                )}
              />
              {errors.currency && (
                <small className="text-red-500">
                  {errors.currency.message}
                </small>
              )}
            </div>
          </div>
          <div className="w-full grid mt-4 grid-cols-1 space-y-4">
            <Input
              label="Account Details"
              type="text"
              name="accountDetails"
              placeholder="Enter account Details"
              register={register}
              errors={errors?.accountDetails}
            />
          </div>
          <div className="w-full grid mt-4 grid-cols-1 gap-3">
            <Input
              label="Payment Terms"
              type="text"
              name="paymentTerms"
              placeholder="Enter your payment terms"
              register={register}
              errors={errors?.paymentTerms}
            />
          </div>
        </div>

        {/* KYC Initialization Option */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="initializeKYC"
              {...register('initializeKYC')}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="initializeKYC"
              className="text-sm font-medium text-gray-700"
            >
              Initialize KYC Process (Optional)
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            This will start the KYC verification process for the vendor after
            creation
          </p>
        </div>
        <div className="mt-5">
          <div className="flex w-fit bg-green-100  mt-7">
            <div
              onClick={() => setTabs('Address')}
              className={`px-4 py-2.5 duration-500 ease-in-out ${
                tabs == 'Address' &&
                'border-b  border-green-500 text-green-500 font-thin '
              } cursor-pointer `}
            >
              <p>Address</p>
            </div>
            <div
              onClick={() => setTabs('Notes')}
              className={`px-4 py-2.5 duration-500 ease-in-out ${
                tabs == 'Notes' &&
                'border-b border-green-500 text-green-500 font-thin '
              } cursor-pointer `}
            >
              <p>Notes</p>
            </div>

            <div
              onClick={() => setTabs('Tax')}
              className={`px-4 py-2.5 duration-500 ease-in-out ${
                tabs == 'Tax' &&
                'border-b border-green-500 text-green-500 font-thin '
              } cursor-pointer `}
            >
              <p>Tax ID</p>
            </div>
          </div>
          <div className="mt-5 pb-20 duration-500 ease-in-out">
            {tabs == 'Address' && (
              <Address register={register} errors={errors?.address ?? {}} />
            )}
            {tabs == 'Notes' && (
              <Notes register={register} errors={errors.notes} />
            )}
            {tabs == 'Tax' && <Tax register={register} errors={errors.taxID} />}
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            isLoading={mutation.isPending}
            text={'Save Vendor'}
            type={'submit'}
          />
        </div>
      </form>
    </Slider>
  );
};

export default SliderVendor;
