'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import React, { useState } from 'react';
import SliderCustomer from './customerSlider';
import BulkSlider from './bulkSlider';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';

const Filter = () => {
  const [selectedValue, setSelectedValue] = useState('All Time'); // Set your default value here
  const [selectedValue2, setSelectedValue2] = useState('pending'); // Set your default value here

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  const handleChange2 = (value: string) => {
    setSelectedValue2(value);
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="w-full flex justify-between ">
      <div className="flex space-x-2 w-[50%]">
        <div className="w-1/2">
          <Search />
        </div>
        {/* <div className="flex mt-4 w-[40%] space-x-2">
          <div className="flex h-[47px] pt-3 w-full px-2 border">
            <p className="text-[17px] -mt-1">Filter&nbsp;: </p>
            <div className="-mt-3">
              <Select
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
          <div className="flex h-[47px] py-3.5  w-full px-2 border">
            <p className="text-[17px] -mt-1">Date&nbsp;: </p>
            <div className="-mt-3">
              <Select
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
        </div> */}
      </div>
      <div className=" w-1/2 flex items-center justify-end">
        <div className="flex justify-end">
          <div className="w-fit justify-end flex">
            <Button
              type={'button'}
              text="Export"
              color
              icon={
                <Image
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  src="/images/export.svg"
                  alt="Export"
                />
              }
              theme="lightBlue"
            />
          </div>
          <div className="w-fit ml-2">
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="px-4 py-2.5 bg-[#005D1F] text-white hover:bg-green-900 flex items-center gap-2"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <i className="ri-file-add-line"></i>
                  New Customer
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[160px] z-[9999]"
                sideOffset={5}
                collisionPadding={10}
              >
                <DropdownMenuItem
                  onClick={() => {
                    setIsCreateOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Single Customer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsUploadOpen(true);
                    setIsDropdownOpen(false);
                  }}
                >
                  Import Customers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SliderCustomer open={isCreateOpen} setOpen={setIsCreateOpen} />
          <BulkSlider open={isUploadOpen} setOpen={setIsUploadOpen} />
        </div>
      </div>
    </div>
  );
};

export default Filter;
