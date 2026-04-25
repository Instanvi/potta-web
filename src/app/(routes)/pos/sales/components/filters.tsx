'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import React, { useState } from 'react';
import NewSalesReciept from '../new/page';
import Link from 'next/link';

const Filter = () => {
  const [selectedValue, setSelectedValue] = useState('All Time'); // Set your default value here
  const [selectedValue2, setSelectedValue2] = useState('pending'); // Set your default value here

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  const handleChange2 = (value: string) => {
    setSelectedValue2(value);
  };

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center space-x-4 w-[60%]">
        <div className="w-[40%]">
          <Search />
        </div>
        <div className="flex items-center space-x-3 w-[60%]">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-700">Filter:</p>
            <Select
              outline
              border={true}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
              ]}
              selectedValue={selectedValue2}
              onChange={handleChange2}
              bg=" "
            />
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-700">Date:</p>
            <Select
              outline
              border={true}
              options={[
                { label: 'All Time', value: 'All Time' },
                { label: 'Yesterday', value: 'Yesterday' },
              ]}
              selectedValue={selectedValue}
              onChange={handleChange}
              bg=" "
            />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button
          type={'button'}
          color
          text="Export"
          icon={<img src="/images/export.svg" />}
          theme="lightBlue"
        />
        <Link href={'/pos/sales/new'}>
          <Button
            text={'Create Sale'}
            icon={<i className="ri-file-add-line"></i>}
            theme="default"
            type={'button'}
          />
        </Link>
      </div>
    </div>
  );
};

export default Filter;
