'use client';
import React, { useState } from 'react';
import RootLayout from '../layout';
import Icon from '../../../components/icon_fonts/icon';
import Select from '../../../components/select';
import DashboardCollection from './components/collection';
import DashboardExpenses from './components/expenses';
import CustomDatePicker from '../../../components/customDatePicker';
import { ContextData } from '@potta/components/providers/DataProvider';

const Dashboard = () => {
  const [swipe, setSwipe] = useState('collection');
  const [startdate, setStartdate] = useState(new Date(2023, 5, 6));
  const [endDate, setEndDate] = useState(new Date(2028, 5, 6));
  const context = React.useContext(ContextData);

  const onDateChange = (startDate: any, endDate: any) => {
    setStartdate(startDate);
    setEndDate(endDate);
  };
  return (
    <RootLayout>
      <div
        className={`${
          context?.layoutMode === 'sidebar' ? 'pl-16 !mt-4' : 'pl-5 !mt-4'
        } pr-5 mt-10`}
      >
        <div className="w-full flex justify-between space-x-10">
          <div className="w-[30%] flex">
            <div
              onClick={() => setSwipe('collection')}
              className={`w-full h-12 flex justify-center cursor-pointer items-center bg-[#F3FBFB] ${
                swipe == 'collection' &&
                'border-b-2 border-[#154406] text-[#154406] font-medium'
              }`}
            >
              <p>Collections</p>
            </div>
            <div
              onClick={() => setSwipe('expenses')}
              className={`w-full h-12 flex justify-center cursor-pointer items-center bg-[#F3FBFB] ${
                swipe == 'expenses' &&
                'border-b-2 border-[#154406] text-[#154406] font-medium'
              }`}
            >
              <p>Expenses</p>
            </div>
          </div>
          <div className="w-[65%]  flex justify-end">
            <div className="w-full h-12 px-3 flex border-r justify-center items-center bg-[#F3FBFB]">
              <div className="flex w-full space-x-2 mt-1  py-1">
                <CustomDatePicker
                  startDate={startdate}
                  endDate={endDate}
                  minDate={new Date(2020, 0, 1)}
                  maxDate={new Date(2030, 11, 31)}
                  onChange={onDateChange}
                />
              </div>
            </div>
            <div className="w-full h-12 flex border-r justify-center items-center bg-[#F3FBFB]">
              <Select
                options={[{ label: '', value: '' }]}
                name="Pending"
                selectedValue={''}
                onChange={() => {}}
                bg={''}
              />
            </div>
            <div className="w-full h-12 border-r  flex justify-center items-center bg-[#F3FBFB]">
              <Select
                options={[{ label: '', value: '' }]}
                name="MOMO"
                selectedValue={''}
                onChange={() => {}}
                bg={''}
              />
            </div>
            <div className="w-full h-12 flex justify-center items-center bg-[#F3FBFB]">
              <div className="flex space-x-2">
                <Icon icon="Users" size={20} color="black" />
                <p>All Team</p>
              </div>
            </div>
          </div>
        </div>
        {swipe == 'collection' && <DashboardCollection />}
        {swipe == 'expenses' && <DashboardExpenses />}
      </div>
    </RootLayout>
  );
};
export default Dashboard;
