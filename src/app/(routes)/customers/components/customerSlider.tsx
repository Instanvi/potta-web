'use client';
import React, { useContext, useState, useEffect } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import { SingleValue } from 'react-select';
import Select from '@potta/components/select';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Button from '@potta/components/button';
import Address from './address';
import { ContextData } from '@potta/components/providers/DataProvider';
import { CustomerPayload, customerSchema } from '../utils/validations';
import Notes from './note';
import Tax from './tax';
import useCreateCustomer from '../hooks/useCreateCustomer';
import toast from 'react-hot-toast';
import { PhoneInput } from '@potta/components/phoneInput';
// Import shadcn date picker components
import { Calendar } from '@potta/components/shadcn/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Button as ShadcnButton } from '@potta/components/shadcn/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@potta/lib/utils';

interface CustomerCreateProps {
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}

// Define the PhoneMetadata interface to match what our PhoneInput component provides
interface PhoneMetadata {
  formattedValue: string;
  countryCode: string;
  rawInput: string;
}

const SliderCustomer: React.FC<CustomerCreateProps> = ({
  open: controlledOpen, // Renamed to avoid naming conflict
  setOpen: setControlledOpen,
}) => {
  const [tabs, setTabs] = useState<string>('Address');
  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);
  // Track phone metadata separately to maintain all parts of the phone number
  const [phoneMetadata, setPhoneMetadata] = useState<PhoneMetadata>({
    formattedValue: '',
    countryCode: '+237', // Default to Cameroon
    rawInput: '',
  });

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;
  const context = useContext(ContextData);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CustomerPayload>({
    resolver: yupResolver(customerSchema),
    defaultValues: {
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
      creditLimit: 0,
      gender: undefined,
      date_of_birth: undefined, // Add default value for dateOfBirth
    },
  });

  const CustomerTypeEnum = [
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'COMPANY', label: 'Company' },
  ];

  const CustomerGenderEnum = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const mutation = useCreateCustomer();
  const onSubmit = (data: CustomerPayload) => {
    console.log('Submitted Data:', data);
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success('Customer created successfully!');
        reset();
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error('Failed to create Customer');
      },
    });
  };

  // Handle phone number changes with the new API
  const handlePhoneChange = (
    combinedValue: string,
    metadata: PhoneMetadata
  ) => {
    // Store the complete metadata for future reference
    setPhoneMetadata(metadata);

    // Set the combined value (country code + phone number) to the form
    setValue('phone', combinedValue);
  };

  // Reset form and metadata when the form is closed
  useEffect(() => {
    if (!isOpen) {
      reset();
      setPhoneMetadata({
        formattedValue: '',
        countryCode: '+237',
        rawInput: '',
      });
    }
  }, [isOpen, reset]);

  return (
    <Slider
      open={isOpen} // Use controlled or local state
      setOpen={setIsOpen} // Use controlled or local setter
      edit={false}
      title={'Create Customer'}
      buttonText="customer"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative h-screen w-full max-w-4xl "
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
            {errors.gender && (
              <small className="text-red-500">{errors.gender.message}</small>
            )}
          </div>
        </div>
        {/* Date of Birth Field */}
        <div className="w-full mb-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <Controller
              control={control}
              name="date_of_birth"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <ShadcnButton
                      variant="outline"
                      className={cn(
                        'w-1/2 py-5  justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </ShadcnButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date_of_birth && (
              <small className="text-red-500">
                {errors.date_of_birth.message}
              </small>
            )}
          </div>
        </div>
        <hr />
        <div className="mt-2">
          <h1 className="text-xl">Contact Information </h1>
          <div className="w-full grid mt-7 grid-cols-2 gap-3">
            <div>
              {/* Phone Input Component with correct props */}
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <>
                    <PhoneInput
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={phoneMetadata.formattedValue} // Use the formatted value from metadata
                      onChange={handlePhoneChange}
                      whatsapp={false}
                      countryCode={phoneMetadata.countryCode} // Use the country code from metadata
                    />
                    {errors.phone && (
                      <small className="text-red-500">
                        {errors.phone.message}
                      </small>
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
          <div className="flex gap-2 w-full justify-end">
            <Button
              text={'Add Customer'}
              type={'submit'}
              isLoading={mutation.isPending}
            />
          </div>
        </div>
      </form>
    </Slider>
  );
};

export default SliderCustomer;
