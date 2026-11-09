'use client';
import Button from '@potta/components/button';
import { Can } from '@/components/auth/can';
import React, { useState } from 'react';
import SliderVendor from './vendorSlider';
import DynamicFilter from '@potta/components/dynamic-filter';
import { ListToolbar } from '../../_shared/states';

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
        { label: 'Unverified', value: 'unverified' },
      ],
      value: kycFilter,
      onChange: onKycFilterChange,
      selectClassName: 'min-w-[120px]',
    },
  ];

  return (
    <ListToolbar
      actions={
        <>
          <Button
            text={'Export'}
            icon={<img src="/images/export.svg" />}
            theme="lightBlue"
            type={'button'}
            color={true}
          />
          <Can resource="Vendor" action="create">
            <SliderVendor />
          </Can>
        </>
      }
    >
      <DynamicFilter
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onSearchClear={onSearchClear}
        searchPlaceholder="Search vendors by name, email, or phone..."
        filters={filterConfig}
        className="p-0"
      />
    </ListToolbar>
  );
};

export default Filter;
