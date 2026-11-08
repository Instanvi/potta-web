'use client';
import React from 'react';
import Link from 'next/link';
import Button from '@potta/components/button';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Can } from '@/components/auth/can';
import { useVendorOptions } from '../../hooks';

interface FilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  vendorId: string;
  onVendorChange: (value: string) => void;
}

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Issued', value: 'ISSUED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
];

const Filter: React.FC<FilterProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  vendorId,
  onVendorChange,
}) => {
  const { data: vendors = [] } = useVendorOptions();

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <DynamicFilter
          searchValue={search}
          onSearchChange={(e) => onSearchChange(e.target.value)}
          onSearchClear={() => onSearchChange('')}
          searchPlaceholder="Search bill no., vendor invoice no. or vendor"
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: status,
              options: statusOptions,
              onChange: onStatusChange,
            },
            {
              key: 'vendor',
              label: 'All vendors',
              value: vendorId,
              isSearchable: true,
              selectClassName: 'min-w-[220px]',
              options: vendors.map((v) => ({ label: v.name, value: v.uuid })),
              onChange: onVendorChange,
            },
          ]}
        />
      </div>
      <Can resource="Bill" action="create">
        <Link href="/account_payables/bills/new">
          <Button text="New bill" icon={<i className="ri-file-add-line" />} theme="default" type="button" />
        </Link>
      </Can>
    </div>
  );
};

export default Filter;
