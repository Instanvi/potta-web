'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import React, { useState } from 'react';

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
    <div className="w-full flex justify-between ">
      <div className="flex space-x-2 ">
        <div className=" ">
          <Search />
        </div>
        <div className="flex mt-4  space-x-2 ">
          <div className="flex h-[47px]  w-full px-2 border items-center">
            <p className="text-[17px] -mt-1">Filter&nbsp;: </p>
            <div className="-mt-3">
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
                bg=" " // Add your desired background class here
              />
            </div>
          </div>
          <div className="flex h-[47px] py-3.5 items-center space-x-1 w-full px-2 border">
            <p className="text-[17px] -mt-1">Date&nbsp;: </p>
            <div className="-mt-3">
              <Select
              outline
                border={true}
                options={[
                  { label: 'All Time', value: 'All Time' },
                  { label: 'Yesterday', value: 'Yesterday' },
                ]}
                selectedValue={selectedValue}
                onChange={handleChange}
                bg=" " // Add your desired background class here
              />
            </div>
          </div>
        </div>
      </div>
      <div className="  mt-4  ">
        <div className="flex  space-x-2">
          <div className=" flex justify-end ">
            <Button
              type={'button'}
              color
              text="Export"
              icon={<img src="/images/export.svg" />}
              theme="lightBlue"
            />
          </div>
          <div className="">
          <Link className='flex justify-end' href={'/pos/sales/new'}>
                <Button
                  text={'Create Sale'}
                  icon={<i className="ri-file-add-line"></i>}
                  theme="default"
                  type={'button'}
                />
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filter;
