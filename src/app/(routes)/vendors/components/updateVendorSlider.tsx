'use client';
import React, { useContext, useEffect, useState } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import Select from '@potta/components/select';
import { useForm, Controller } from 'react-hook-form';
import Button from '@potta/components/button';
import Address from './address';
import { ContextData } from '@potta/components/providers/DataProvider';
// import {
//   UpdateVendorPayload,
//   updateVendorSchema,
//   vendorSchema,
// } from '../utils/validations';

// Define the form data structure (what the user fills in)
interface VendorFormData {
  type: 'individual' | 'company';
  name: string;
  vendorId: string;
  paymentTerms?: string | null;
  accountDetails?: string | null;
  openingBalance?: number;
  currency: 'USD' | 'EUR' | 'XAF';
  contactPerson: string;
  email: string;
  phone: string;
  taxId?: string | null;
  website?: string | null;
  classification: 'Supplier' | 'Service Provider';
  notes?: string | null;
  address: {
    address: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
}

// Define the exact API payload structure (what gets sent to the server)
interface VendorUpdateApiPayload {
  type: 'individual' | 'company';
  name: string;
  vendorId: string;
  paymentTerms?: string | null;
  accountDetails?: string | null;
  openingBalance?: number;
  currency: 'USD' | 'EUR' | 'XAF';
  contactPerson: string;
  email: string;
  phone: string;
  taxId?: string | null;
  website?: string | null;
  classification: 'Supplier' | 'Service Provider';
  notes?: string | null;
  address: {
    address: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
}
import Notes from './note';
import Tax from './tax';
import useUpdateVendor from '../hooks/useUpdateVendor';
import toast from 'react-hot-toast';

interface EditVendorProps {
  vendor: VendorFormData | null; // Existing vendor data
  vendorId: string; // ID of the vendor to be edited
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

const EditVendor: React.FC<EditVendorProps> = ({
  vendor,
  vendorId,
  open: controlledOpen, // Renamed to avoid naming conflict
  setOpen: setControlledOpen,
}) => {
  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const [tabs, setTabs] = useState<string>('Address');
  const context = useContext(ContextData);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<VendorFormData>({
    // resolver: yupResolver(updateVendorSchema),
    defaultValues: vendor || {
      type: 'individual',
      name: '',
      vendorId: vendorId,
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
      taxId: '',
      paymentTerms: '',
      website: '',
      accountDetails: '',
      currency: 'USD',
      openingBalance: 0,
      classification: 'Supplier',
      status: 'PENDING',
      notes: '',
    },
  });

  // Reset form when vendor data changes
  useEffect(() => {
    if (vendor) {
      reset(vendor);
    }
  }, [vendor, reset]);

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

  const VendorStatusEnum = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const mutation = useUpdateVendor(vendorId); // Hook for updating vendor
  const onSubmit = (data: VendorFormData) => {
    // Transform the form data to only include the fields specified in the API
    const updatePayload: VendorUpdateApiPayload = {
      type: data.type,
      name: data.name,
      vendorId: data.vendorId,
      paymentTerms: data.paymentTerms || null,
      accountDetails: data.accountDetails || null,
      openingBalance: data.openingBalance || undefined,
      currency: data.currency,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      taxId: data.taxId || null,
      website: data.website || null,
      classification: data.classification,
      notes: data.notes || null,
      address: {
        address: data.address.address,
        city: data.address.city,
        state: data.address.state || undefined,
        country: data.address.country,
        postalCode: data.address.postalCode || undefined,
        latitude: data.address.latitude || undefined,
        longitude: data.address.longitude || undefined,
      },
      status: data.status,
    };

    console.log('Sending only required fields:', updatePayload);
    mutation.mutate(updatePayload, {
      onSuccess: () => {
        toast.success('Vendor updated successfully!');
        reset(); // Reset the form after success
        setIsOpen(false);
      },
      onError: () => {
        toast.error('Failed to update vendor');
      },
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={true}
      title={'Edit Vendor'}
      buttonText="update vendor"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative h-[97%] w-full max-w-4xl "
      >
        <div className="w-full grid grid-cols-2 gap-3">
          <Input
            label="Vendor Name"
            type="text"
            name="name"
            placeholder="Enter vendor name"
            register={register}
            errors={errors.name}
            required
          />
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
          </div>
        </div>
        <div className="w-full grid my-5 grid-cols-2 gap-3">
          <Input
            label="Contact Name"
            type="text"
            name="contactPerson"
            placeholder="Enter Contact Name"
            register={register}
            errors={errors.contactPerson}
          />

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
          </div>
          <div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={VendorStatusEnum}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="Select Status"
                  label="Status"
                  required
                />
              )}
            />
          </div>
        </div>
        <hr />
        <h1 className="text-xl mt-2">Contact Information</h1>
        <div className="w-full grid mt-7 grid-cols-2 gap-3">
          <Input
            type="tel"
            label="Phone Number"
            name="phone"
            placeholder="(555) 123-4567"
            register={register}
            errors={errors.phone}
            required
          />
          <Input
            type="text"
            label="Email"
            name="email"
            placeholder="abcdfg@abc.com"
            register={register}
            errors={errors.email}
            required
          />
        </div>
        <div className="w-full grid mt-4 grid-cols-1 space-y-4">
          <Input
            type="text"
            label="Website"
            name="website"
            placeholder="www.example.com"
            register={register}
            errors={errors.website}
          />
        </div>
        <div className="w-full grid mt-4 grid-cols-2 gap-3">
          <Input
            type="number"
            label="Opening Balance"
            placeholder="00"
            name="openingBalance"
            register={register}
            errors={errors.openingBalance}
          />
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
        <div className="w-full grid mt-4 grid-cols-2 gap-3">
          <Input
            label="Payment Terms"
            type="text"
            name="paymentTerms"
            placeholder="Enter your payment terms"
            register={register}
            errors={errors?.paymentTerms}
          />
        </div>
        <div className="mt-5">
          <div className="flex w-fit bg-green-100 mt-7">
            {['Address', 'Notes', 'Tax'].map((tab) => (
              <div
                key={tab}
                onClick={() => setTabs(tab)}
                className={`px-4 py-2.5 cursor-pointer ${
                  tabs === tab ? 'border-b border-green-500 text-green-500' : ''
                }`}
              >
                <p>{tab}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pb-20">
            {tabs === 'Address' && (
              <Address register={register} errors={errors?.address ?? {}} />
            )}
            {tabs === 'Notes' && (
              <Notes register={register} errors={errors.notes} />
            )}
            {tabs === 'Tax' && (
              <Tax register={register} errors={errors.taxId} />
            )}
          </div>
        </div>
        <div className="flex-grow" /> {/* This div takes up remaining space */}
        <div className="text-center md:text-right  md:flex  space-x-4 fixed bottom-0 left-0 right-0 justify-center bg-white p-4">
          <div className="flex gap-2 w-full max-w-4xl justify-between">
            <Button
              text="Cancel"
              type="button"
              theme="danger"
              onClick={() => setIsOpen(false)}
            />
            <Button
              isLoading={mutation.isPending}
              text="Update Vendor"
              type="submit"
            />
          </div>
        </div>
      </form>
    </Slider>
  );
};

export default EditVendor;
