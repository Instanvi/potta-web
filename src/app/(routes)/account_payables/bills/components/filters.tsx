'use client';
import React from 'react';
import Button from '@potta/components/button';
import DynamicFilter from '@potta/components/dynamic-filter';
import Image from 'next/image';
import { CustomSearchBar } from '@potta/components/shared/CustomSearchBar';
import { CreateBillSheet } from './CreateBillSheet';

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  status: string;
  onStatusChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

const paymentMethodOptions = [
  { label: 'All', value: 'all' },
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'Bank Transfer', value: 'Bank Transfer' },
  { label: 'ACH Transfer', value: 'ACH Transfer' },
  { label: 'Mobile Money', value: 'Mobile Money' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Credit', value: 'Credit' },
  { label: 'Other', value: 'Other' },
];

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Issued', value: 'Issued' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Overdue', value: 'Overdue' },
];

const Filter: React.FC<FilterProps> = ({
  search,
  onSearchChange,
  onSearchClear,
  status,
  onStatusChange,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      value: status,
      options: statusOptions,
      onChange: onStatusChange,
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      value: paymentMethod,
      options: paymentMethodOptions,
      onChange: onPaymentMethodChange,
    },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-4 whitespace-normal break-words">
      <div className="flex-1">
        <div className="space-y-3">
          <CustomSearchBar
            value={search}
            onChange={onSearchChange}
            placeholder="search bills"
          />
          <DynamicFilter
            searchValue={search}
            onSearchChange={(e) => onSearchChange(e.target.value)}
            onSearchClear={onSearchClear}
            searchPlaceholder="Search bills..."
            filters={filterConfig}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 justify-end items-center mt-2 md:mt-0">
        <Button
          type={'button'}
          color
          text="Export"
          icon={
            <Image
              src="/images/export.svg"
              alt="Export"
              width={16}
              height={16}
            />
          }
          theme="lightBlue"
        />
        <Button
          text={'Create New'}
          icon={<i className="ri-file-add-line"></i>}
          theme="default"
          type={'button'}
          onClick={() => setSheetOpen(true)}
        />
      </div>
      <CreateBillSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

export default Filter;
