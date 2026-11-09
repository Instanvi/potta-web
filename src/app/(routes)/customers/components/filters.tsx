'use client';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import React, { useState } from 'react';
import SliderCustomer from './customerSlider';
import BulkSlider from './bulkSlider';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import { ListToolbar } from '../../_shared/states';

interface FilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({ searchValue, onSearchChange }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <ListToolbar
        actions={
          <>
            <Button
              type={'button'}
              text="Export"
              color
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
        <Search
          placeholder="Search customers by name, email or phone..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </ListToolbar>
      <SliderCustomer open={isCreateOpen} setOpen={setIsCreateOpen} />
      <BulkSlider open={isUploadOpen} setOpen={setIsUploadOpen} />
    </>
  );
};

export default Filter;
