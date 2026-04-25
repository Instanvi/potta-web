'use client';
import React, { useContext, useEffect, useState } from 'react';
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
import Text from '@potta/components/textDisplay';
import useGetOneCustomer from '../hooks/useGetOneCustomer';
import { PhoneFlag } from './table';
interface CustomerDetailsProps {
  customerId: string;
  open?: boolean; // Optional controlled open state
  setOpen?: (open: boolean) => void; // Optional setter from parent
}
const ViewCustomerSlider: React.FC<CustomerDetailsProps> = ({
  customerId,
  open: controlledOpen, // Renamed to avoid naming conflict
  setOpen: setControlledOpen,
}) => {
  const context = useContext(ContextData);
  const { data, isLoading, error, refetch } = useGetOneCustomer(customerId);

  // Local state as fallback if no controlled state is provided
  const [localOpen, setLocalOpen] = useState(false);

  // Determine which open state to use
  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  useEffect(() => {
    if (isOpen && customerId) {
      refetch();
    }
  }, [customerId, refetch, isOpen]);
  return (
    <Slider
      open={isOpen} // Use controlled or local state
      setOpen={setIsOpen} // Use controlled or local setter
      edit={false}
      title={'Vendor Details'}
      buttonText="view vendor"
    >
      {isLoading && (
        <div className="flex justify-center items-center py-10 h-screen">
          Loading
        </div>
      )}

      {error && (
        <p className="text-red-600 text-center">
          Error fetching customer details: {error.message}
        </p>
      )}

      {!data ||
        (Object.keys(data).length === 0 && (
          <p className="text-gray-500 text-center">No customer data available.</p>
        ))}

      {data && (
        <div className="relative h-screen w-full max-w-4xl">
          {/* Header */}
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Name" value={`${data.firstName} ${data.lastName}`} height />
            <Text name="Type" value={data.type} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Email" value={data.email} height />
            <div className="">
              <span className="mb-3 text-gray-900 font-medium">Phone Number</span>
              <div className={`w-full py-1.5' px-4 mt-2`}>
                {data.phone && <PhoneFlag phoneNumber={`${data.phone}`} />}
              </div>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Contact Person" value={data.contactPerson} height />
            <Text name="Credit Limit" value={data.creditLimit} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Status" value={data.status} height />
            <Text name="TaxId" value={data.taxId} height />
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Created At" value={data.createdAt} height />
          </div>
          <hr className='my-8'/>

          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Address" value={data.address.address} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="City" value={data.address.city} height />
            <Text name="Postal Code" value={data.address.postalCode} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="State" value={data.address.state} height />
            <Text name="Country" value={data.address.country} height />
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <Text name="Latitude" value={data.address.latitude} height />
            <Text name="Longitude" value={data.address.longitude} height />
          </div>

          {/* <div className="text-center md:text-right mt-4 md:flex md:justify-end space-x-4">
            <Button
              text="Cancel"
              type="button"
              theme="gray"
              color={true}
              onClick={() => setIsSliderOpen(false)}
            />
          </div> */}
        </div>
      )}
    </Slider>
  );
};

export default ViewCustomerSlider;
