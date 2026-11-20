'use client';
import Button from '@potta/components/button';
import React, { useState } from 'react';
import Slider from '@potta/components/slideover';
import ReimbursementForm from './ReimbursementForm';
import DynamicFilter from '@potta/components/dynamic-filter';
import Image from 'next/image';

interface FilterProps {
  onNew: () => void;
  onFiltersChange?: (filters: {
    search?: string;
    status?: string;
    type?: string;
  }) => void;
  currentFilters?: {
    search: string;
    status: string;
    type: string;
  };
}

const Filter = ({ onNew, onFiltersChange, currentFilters }: FilterProps) => {
  const [selectedValue, setSelectedValue] = useState('All Time');
  const [selectedStatus, setSelectedStatus] = useState(
    currentFilters?.status || 'all'
  );
  const [selectedType, setSelectedType] = useState(
    currentFilters?.type || 'all'
  );
  const [sliderOpen, setSliderOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(currentFilters?.search || '');

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Paid', value: 'PAID' },
  ];

  const typeOptions = [
    { label: 'All', value: 'all' },
    { label: 'Mileage', value: 'mileage' },
    { label: 'Out of Pocket', value: 'out_of_pocket' }
  ];

  const dateOptions = [
    { label: 'All Time', value: 'All Time' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'Last 7 Days', value: 'Last 7 Days' },
    { label: 'Last 30 Days', value: 'Last 30 Days' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onFiltersChange?.({
      search: value,
      status: selectedStatus,
      type: selectedType,
    });
  };

  const handleSearchClear = () => {
    setSearchValue('');
    onFiltersChange?.({
      search: '',
      status: selectedStatus,
      type: selectedType,
    });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    onFiltersChange?.({
      search: searchValue,
      status: value,
      type: selectedType,
    });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onFiltersChange?.({
      search: searchValue,
      status: selectedStatus,
      type: value,
    });
  };

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: statusOptions,
      value: selectedStatus,
      onChange: handleStatusChange,
      selectClassName: 'min-w-[140px]',
    },
    {
      key: 'type',
      label: 'Type',
      options: typeOptions,
      value: selectedType,
      onChange: handleTypeChange,
      selectClassName: 'min-w-[140px]',
    },
    {
      key: 'date',
      label: 'Date',
      options: dateOptions,
      value: selectedValue,
      onChange: setSelectedValue,
      selectClassName: 'min-w-[140px]',
    },
  ];

  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex-1">
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Search reimbursements..."
          filters={filterConfig}
          className="p-0 bg-transparent"
        />
      </div>
      <div className="flex items-center space-x-3 ml-4">
        <Button
          type={'button'}
          color
          text="Export"
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
        <Button
          text={'New'}
          icon={<i className="ri-file-add-line"></i>}
          theme="default"
          type={'button'}
          onClick={() => setSliderOpen(true)}
        />
        <Slider
          title="New Reimbursement"
          edit={false}
          open={sliderOpen}
          setOpen={setSliderOpen}
        >
          <ReimbursementForm
            onSubmit={onNew}
            onClose={() => setSliderOpen(false)}
          />
        </Slider>
      </div>
    </div>
  );
};

export default Filter;
