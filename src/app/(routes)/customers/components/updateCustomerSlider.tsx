'use client';
import React, { useContext, useEffect, useState } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import Select from '@potta/components/select';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@potta/components/button';
import Address from './address';
import { ContextData } from '@potta/components/providers/DataProvider';
import {
  UpdateCustomerPayload,
  updateCustomerSchema,
  customerSchema,
} from '../utils/validations';
import Notes from './note';
import Tax from './tax';
import useUpdateCustomer from '../hooks/useUpdateCustomer';
import toast from 'react-hot-toast';
import { PhoneInput } from '@potta/components/phoneInput';

interface EditCustomerProps {
  customer: UpdateCustomerPayload | null; // Existing vendor data
  customerId: string; // ID of the vendor to be edited
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

// Define the PhoneMetadata interface to match what our PhoneInput component provides
interface PhoneMetadata {
  formattedValue: string;
  countryCode: string;
  rawInput: string;
}

const EditVendor: React.FC<EditCustomerProps> = ({
  customer,
  customerId,
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

  // Track phone metadata separately to maintain all parts of the phone number
  const [phoneMetadata, setPhoneMetadata] = useState<PhoneMetadata>({
    formattedValue: '',
    countryCode: '+237', // Default to Cameroon
    rawInput: ''
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateCustomerPayload>({
    resolver: yupResolver(updateCustomerSchema),
    defaultValues: customer || {
      firstName: '',
      lastName: '',
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
      taxId: '',
      gender: undefined,
      status: undefined,
      creditLimit: 0
    },
  });

  // Extract country code and phone number from the full phone number
  const extractPhoneComponents = (fullPhoneNumber: string): { countryCode: string; phoneNumber: string } => {
    // Common country code patterns
    const countryCodePatterns = [
      /^\+(\d{1,4})/, // Format: +XXX
      /^00(\d{1,4})/, // Format: 00XXX
    ];
    
    let countryCode = '+237'; // Default
    let phoneNumber = fullPhoneNumber;
    
    // Try to extract country code using the patterns
    for (const pattern of countryCodePatterns) {
      const match = fullPhoneNumber.match(pattern);
      if (match) {
        if (pattern.toString().includes('00')) {
          // Convert 00XXX format to +XXX format
          countryCode = `+${match[1]}`;
          phoneNumber = fullPhoneNumber.replace(match[0], '');
        } else {
          countryCode = match[0];
          phoneNumber = fullPhoneNumber.replace(match[0], '');
        }
        break;
      }
    }
    
    return {
      countryCode,
      phoneNumber: phoneNumber.trim() // Remove any leading/trailing spaces
    };
  };

  // Reset form and extract phone details when customer data changes
  useEffect(() => {
    if (customer) {
      reset(customer);

      // Extract country code and phone number
      if (customer.phone) {
        const { countryCode, phoneNumber } = extractPhoneComponents(customer.phone);
        
        // Set the phone metadata with separated components
        setPhoneMetadata({
          formattedValue: customer.phone,
          countryCode: countryCode,
          rawInput: phoneNumber // Just the number without country code
        });
        
        // For debugging
        console.log('Phone components extracted:', {
          original: customer.phone,
          countryCode,
          phoneNumber
        });
      }
    }
  }, [customer, reset]);

  const CustomerTypeEnum = [
    { value: 'individual', label: 'Individual' },
    { value: 'company', label: 'Company' },
  ];
  const CustomerGenderEnum = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const CustomerStatusEnum = [
    { value: 'pending', label: 'Pending' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'complete', label: 'Complete' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'available', label: 'Available' },
    { value: 'expired', label: 'Expired' },
    { value: 'taken', label: 'Taken' },
  ];

  // Handle phone number changes with the new API
  const handlePhoneChange = (combinedValue: string, metadata: PhoneMetadata) => {
    // Store the complete metadata for future reference
    setPhoneMetadata(metadata);

    // Set the combined value (country code + phone number) to the form
    setValue('phone', combinedValue);
    
    // For debugging
    console.log('Phone changed:', {
      combinedValue,
      metadata
    });
  };

  const mutation = useUpdateCustomer(customerId); // Hook for updating vendor
  const onSubmit = (data: UpdateCustomerPayload) => {
    console.log('Updated Data:', data);
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success('Customer updated successfully!');
        reset(); // Reset the form after success
        setIsOpen(false);
      },
      onError: () => {
        toast.error('Failed to update Customer');
      },
    });
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <Slider
      open={isOpen}
      setOpen={setIsOpen}
      edit={true}
      title={'Edit Customer'}
      buttonText="update customer"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative h-screen w-full max-w-4xl"
      >
        <div className="w-full grid grid-cols-2 gap-3">
          <div>
            <Input
              label="First Name"
              type="text"
              name="firstName"
              placeholder="Enter customer First Name"
              register={register}
              errors={errors.firstName}
              required
            />
          </div>
          <div>
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              placeholder="Enter customer Last Name"
              register={register}
              errors={errors.lastName}
              required
            />
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
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  options={CustomerTypeEnum}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="Select Customer Type"
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
              label="Credit Limit"
              type="number"
              name="creditLimit"
              placeholder="Enter Credit limit"
              register={register}
              errors={errors.creditLimit}
            />
          </div>
          <div>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  options={CustomerGenderEnum}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                  name="Select Customer Gender"
                  label="Gender"
                  required
                />
              )}
            />
            {errors.type && (
              <small className="text-red-500">{errors.type.message}</small>
            )}
          </div>
          <div>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={CustomerStatusEnum}
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
        <div className="mt-2">
          <h1 className="text-xl">Contact Information </h1>
          <div className="w-full grid mt-7 grid-cols-2 gap-3">
            <div>
              {/* Phone Input Component with separate phone number (without country code) */}
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <>
                    <PhoneInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={phoneMetadata.rawInput} // Only the phone number without country code
                      onChange={handlePhoneChange}
                      whatsapp={false}
                      countryCode={phoneMetadata.countryCode} // Country code passed separately
                    />
                    {errors.phone && (
                      <small className="text-red-500">{errors.phone.message}</small>
                    )}
                  </>
                )}
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
              />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex w-fit bg-green-100  mt-7">
            <div
              onClick={() => setTabs('Address')}
              className={`px-4 py-2.5 duration-500 ease-in-out ${
                tabs == 'Address' &&
                'border-b  border-green-500 text-green-500 font-normal '
              } cursor-pointer `}
            >
              <p>Address</p>
            </div>

            <div
              onClick={() => setTabs('Tax')}
              className={`px-4 py-2.5 duration-500 ease-in-out ${
                tabs == 'Tax' &&
                'border-b border-green-500 text-green-500 font-normal '
              } cursor-pointer `}
            >
              <p>Tax ID</p>
            </div>
          </div>
          <div className="mt-5 pb-20 duration-500 ease-in-out">
            {tabs == 'Address' && (
              <Address register={register} errors={errors?.address ?? {}} />
            )}
            {tabs == 'Tax' && <Tax register={register} errors={errors.taxId} />}
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
            text="Update Customer"
            type="submit"
          />
        </div>
        </div>
      </form>
    </Slider>
  );
};

export default EditVendor;