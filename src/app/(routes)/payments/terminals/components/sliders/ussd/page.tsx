'use client';
import React, { useState } from 'react';
import Input from '@potta/components/input';
import CustomSelect from '@potta/components/react-select';
import Slider from '@potta/components/slideover';
import { SingleValue } from 'react-select';
import Select from '@potta/components/select';

import Button from '@potta/components/button';

interface Cat {
  value: string;
  label: string;
}

const category: Cat[] = [
  {
    value: 'Office Stationary',
    label: 'Office Stationary',
  },
  {
    value: 'Travel Expenses',
    label: 'Travel Expenses',
  },
];

const SliderUSSD = () => {
  const [selectedCategory, setSelectedCategory] = useState<Cat[] | null | any>(
    null
  );
  const [tabs, setTabs] = useState<string>('control');

  const handleCategoryChange = (selected: SingleValue<Cat> | Cat[]) => {
    // If multi is true, the selected value is an array
    setSelectedCategory(selected as Cat[]);
  };

  return (
    <Slider edit={false} title={'New USSD'} buttonText="ussd">
      <div className="relative h-[97%] w-full">
        <div className="w-full  ">
          <p className="mb-2.5">
            Select USSD APPLICATION{' '}
            <small className="text-gray-400">
              <em>(payment Apps creation on flows)</em>
            </small>
          </p>
          <Select
            options={[
              { value: 'Daily Collection App', label: 'Daily Collection App' },
            ]}
            selectedValue={'Daily Collection App'}
            onChange={() => {}}
            bg={''}
          />
        </div>
        <div className="w-full mt-5 ">
          <p className="mb-2.5">Description</p>
          <textarea
            name=""
            className="w-full outline-none border p-2"
            rows={10}
            id=""
          ></textarea>
        </div>

        <div className="absolute bottom-0 right-0 m-5">
          <Button text={'Create Terminal'} type={'button'} />
        </div>
      </div>
    </Slider>
  );
};

export default SliderUSSD;
