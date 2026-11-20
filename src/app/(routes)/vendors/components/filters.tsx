'use client';
import Button from '@potta/components/button';
import React, { useState } from 'react';
import SliderVendor from './vendorSlider';
import DynamicFilter from '@potta/components/dynamic-filter';

interface FilterProps {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClear: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  kycFilter: string;
  onKycFilterChange: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({
  searchValue,
  onSearchChange,
  onSearchClear,
  statusFilter,
  onStatusFilterChange,
  kycFilter,
  onKycFilterChange,
}) => {
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
      ],
      value: statusFilter,
      onChange: onStatusFilterChange,
      selectClassName: 'min-w-[120px]',
    },
    {
      key: 'kyc',
      label: 'KYC Status',
      options: [
        { label: 'All KYC', value: 'all' },
        { label: 'Verified', value: 'verified' },
        { label: 'Pending (KYC Started)', value: 'pending' },
        { label: 'Not Initialized', value: 'not_initialized' },
      ],
      value: kycFilter,
      onChange: onKycFilterChange,
      selectClassName: 'min-w-[120px]',
    },
  ];

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center w-full">
        {/* Left side - Dynamic Filter */}
        <div className="flex-1">
          <DynamicFilter
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onSearchClear={onSearchClear}
            searchPlaceholder="Search vendors by name, email, or phone..."
            filters={filterConfig}
            className="p-0 bg-transparent"
          />
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            text={'Export'}
            icon={<img src="/images/export.svg" />}
            theme="lightBlue"
            type={'button'}
            color={true}
          />
          <SliderVendor />
        </div>
      </div>
    </div>
  );
};

export default Filter;
