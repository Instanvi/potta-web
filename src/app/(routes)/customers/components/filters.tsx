'use client';
import Search from '@potta/components/search';
import React, { useState } from 'react';
import SliderCustomer from './customerSlider';
import BulkSlider from './bulkSlider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import { ListToolbar } from '../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { useContactToolbarStart } from '@/components/shared/contact-toolbar';

interface FilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  rows?: any[];
}

const Filter: React.FC<FilterProps> = ({ searchValue, onSearchChange, rows = [] }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toolbarStart = useContactToolbarStart();

  return (
    <>
      <ListToolbar
        actions={
          <>
            <ExportButton
              filename="customers"
              rows={rows}
              columns={[
                {
                  key: 'name',
                  header: 'Customer Name',
                  value: (row) =>
                    `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
                },
                { key: 'phone', header: 'Telephone' },
                { key: 'email', header: 'Email' },
                { key: 'type', header: 'Type' },
                { key: 'status', header: 'Status' },
              ]}
            />
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 whitespace-nowrap rounded-[2px] bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
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
          </>
        }
      >
        {toolbarStart}
        <Search
          placeholder="Search customers by name, email or phone..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </ListToolbar>
      <SliderCustomer open={isCreateOpen} setOpen={setIsCreateOpen} />
      <BulkSlider kind="customer" open={isUploadOpen} setOpen={setIsUploadOpen} />
    </>
  );
};

export default Filter;
