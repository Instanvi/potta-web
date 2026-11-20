'use client';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import Slider from '@potta/components/slideover';
import React, { useState } from 'react';

const SliderInvoice = () => {
  // Define state for form inputs
  const [formData, setFormData] = useState({
    customerName: '',
    telephone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Cameroon',
  });

  // Handle input changes for text and number fields
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    console.log(e.target.name);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle country change (for Select component)
  const handleCountryChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      country: value,
    }));
  };

  // Handle form submission and log form data
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <Slider edit={false} title={'New Customer'} buttonText="Invoice">
      <div className="w-full flex justify-center">
        <form
          onSubmit={handleFormSubmit}
          className="px-5 relative w-[63%] py-2"
        >
          <div className="mt-5">
            <Input
              type={'text'}
              name={'customerName'}
              label="Customer Name"
              value={formData.customerName}
              onchange={handleInputChange}
            />
          </div>
          <div className="mt-5">
            <Input
              type={'text'}
              name={'telephone'}
              label="Telephone Number"
              value={formData.telephone}
              onchange={handleInputChange}
            />
          </div>
          <div className="mt-5">
            <Input
              type={'email'}
              name={'email'}
              label="Email"
              value={formData.email}
              onchange={handleInputChange}
            />
          </div>
          <div className="mt-5">
            <Input
              type={'text'}
              name={'address'}
              label="Address"
              value={formData.address}
              onchange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="mt-5">
              <Input
                type={'text'}
                name={'city'}
                label="City"
                value={formData.city}
                onchange={handleInputChange}
              />
            </div>
            <div className="mt-5">
              <Input
                type={'text'}
                name={'state'}
                label="State"
                value={formData.state}
                onchange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="mt-5">
              <Input
                type={'number'}
                name={'postalCode'}
                label="Postal Code"
                value={formData.postalCode}
                onchange={handleInputChange}
              />
            </div>
            <div className="mt-5">
              <p className="mb-2">Country</p>
              <Select
                options={[
                  { label: 'Cameroon', value: 'Cameroon' },
                  { label: 'USA', value: 'USA' },
                ]}
                selectedValue={formData.country}
                onChange={handleCountryChange}
                bg={''}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button text={'Add Customer'} theme="default" type="submit" />
          </div>
        </form>
      </div>
    </Slider>
  );
};

export default SliderInvoice;
