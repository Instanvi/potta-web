'use client';
import React, { useState } from 'react';
import { Can } from '@/components/auth/can';
import SliderVendor from './vendorSlider';
import BulkSlider from '@potta/app/(routes)/customers/components/bulkSlider';
import DynamicFilter from '@potta/components/dynamic-filter';
import type { Table } from '@tanstack/react-table';
import { ListActionsMenu, ListActionItem } from '@/components/list-actions-menu';
import { ListToolbar } from '../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { useContactToolbarStart } from '@/components/shared/contact-toolbar';

interface FilterProps {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchClear: () => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  kycFilter: string;
  onKycFilterChange: (value: string) => void;
  rows?: any[];
  /** DataTable instance (from useDataTableHandle) for the Columns toggle. */
  table?: Table<any> | null;
}

const Filter: React.FC<FilterProps> = ({
  searchValue,
  onSearchChange,
  onSearchClear,
  statusFilter,
  onStatusFilterChange,
  kycFilter,
  onKycFilterChange,
  rows = [],
  table,
}) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const toolbarStart = useContactToolbarStart();
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
    <>
    <ListToolbar
      actions={
        <>
          <ListActionsMenu table={table}>
          <ExportButton
            asItem
            filename="vendors"
            rows={rows}
            columns={[
              { key: 'name', header: 'Vendor/ Company Name' },
              { key: 'phone', header: 'Telephone' },
              { key: 'email', header: 'Email' },
              { key: 'status', header: 'Status' },
              {
                key: 'isKYCVerified',
                header: 'KYC Status',
                value: (row) => (row.isKYCVerified ? 'Verified' : 'Unverified'),
              },
              { key: 'industry', header: 'Industry' },
              {
                key: 'openingBalance',
                header: 'Balance',
                value: (row) =>
                  row.openingBalance != null
                    ? `${row.currency ?? ''}${row.openingBalance}`
                    : 'N/A',
              },
            ]}
          />
          <Can resource="Vendor" action="create">
            <ListActionItem label="Import" onSelect={() => setIsUploadOpen(true)} />
          </Can>
          </ListActionsMenu>
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
      {toolbarStart}
    </ListToolbar>
      <BulkSlider kind="vendor" open={isUploadOpen} setOpen={setIsUploadOpen} />
    </>
  );
};

export default Filter;
