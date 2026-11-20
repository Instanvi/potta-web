'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import React, { useState } from 'react';
import AddBankAccountSlideover from './AddBankAccountSlideover';

const Filter = () => {
  const [selectedValue, setSelectedValue] = useState('All Time'); // Set your default value here
  const [selectedValue2, setSelectedValue2] = useState('pending'); // Set your default value here
  const [slideoverOpen, setSlideoverOpen] = useState(false);

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  const handleChange2 = (value: string) => {
    setSelectedValue2(value);
  };

  return (
    <>
      <div className="w-full flex justify-between my-4 ">
        <div className="flex space-x-2 w-[50%]">
          <div className=" w-[50%]">
            <Search />
          </div>
          <div className="flex w-[50%] space-x-2">
            <div className="flex items-center gap-2 ">
              <label className="text-sm font-medium whitespace-nowrap">
                Filter:
              </label>
              <Select
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Paid', value: 'paid' },
                ]}
                selectedValue={selectedValue2}
                onChange={handleChange2}
                bg=""
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Date:
              </label>
              <Select
                options={[
                  { label: 'All Time', value: 'All Time' },
                  { label: 'Yesterday', value: 'Yesterday' },
                  { label: 'Last 7 Days', value: 'Last 7 Days' },
                  { label: 'Last 30 Days', value: 'Last 30 Days' },
                ]}
                selectedValue={selectedValue}
                onChange={handleChange}
                bg=""
              />
            </div>
          </div>
        </div>
        <div className=" w-[30%] flex justify-end">
          <div className="flex w-fit gap-4 items-center  ">
            <Button
              type={'button'}
              color
              text="Export"
              icon={<img src="/images/export.svg" />}
              theme="lightBlue"
            />

            <Button
              type={'button'}
              text="Add Bank Account"
              icon={<i className="ri-file-add-line"></i>}
              theme="default"
              onClick={() => setSlideoverOpen(true)}
            />
          </div>
        </div>
      </div>
      <AddBankAccountSlideover
        open={slideoverOpen}
        setOpen={setSlideoverOpen}
      />
    </>
  );
};

const BankAccountDetailsFilter = () => {
  const [selectedValue, setSelectedValue] = useState('All Time');
  const [selectedValue2, setSelectedValue2] = useState('all');

  const handleChange = (value: string) => {
    setSelectedValue(value);
  };
  const handleChange2 = (value: string) => {
    setSelectedValue2(value);
  };

  return (
    <div className="w-full flex justify-between my-4 ">
      <div className="flex space-x-2 w-[50%]">
        <div className=" w-[50%]">
          <Search />
        </div>
        <div className="flex w-[50%] space-x-2">
          <div className="flex items-center gap-2 ">
            <label className="text-sm font-medium whitespace-nowrap">
              Filter:
            </label>
            <Select
              options={[
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Dormant', value: 'dormant' },
              ]}
              selectedValue={selectedValue2}
              onChange={handleChange2}
              bg=""
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">
              Date:
            </label>
            <Select
              options={[
                { label: 'All Time', value: 'All Time' },
                { label: 'Yesterday', value: 'Yesterday' },
                { label: 'Last 7 Days', value: 'Last 7 Days' },
                { label: 'Last 30 Days', value: 'Last 30 Days' },
              ]}
              selectedValue={selectedValue}
              onChange={handleChange}
              bg=""
            />
          </div>
        </div>
      </div>
      <div className=" w-[30%] flex justify-end">
        <div className="flex w-fit gap-4 items-center  ">
          <Button
            type={'button'}
            color
            text="Export"
            icon={<img src="/images/export.svg" />}
            theme="lightBlue"
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
