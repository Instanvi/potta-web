'use client';
import React, { useState } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import Filter from './filters';
import useGetAllCustomers from '../hooks/useGetAllCustomers';
import ViewCustomerSlider from './viewCustomerSlider.tsx';
import EditCustomer from './updateCustomerSlider';
import DeleteModal from './deleteModal';
import { CustomerFilter } from '../utils/types';
import { UpdateCustomerPayload } from '../utils/validations';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState } from '../../_shared/states';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';

export const PhoneFlag = ({
  phoneNumber,
}: {
  phoneNumber: string | number;
}) => {
  const convertToE164 = (phoneNumber: string | number) => {
    if (typeof phoneNumber === 'number') {
      return phoneNumber.toString();
    }
    return phoneNumber;
  };
  const phoneNumberObj = parsePhoneNumberFromString(convertToE164(phoneNumber));
  const countryCode = phoneNumberObj?.country;
  const number = phoneNumberObj?.number;
  return countryCode ? (
    <div className="flex items-center">
      <div className="">
        <Image
          width={200}
          height={200}
          className="w-full h-full object-cover"
          src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
          alt={countryCode}
        />
      </div>
      {number}
    </div>
  ) : (
    <p>Invalid Number</p>
  );
};

const TableComponents = () => {
  const [openViewModal, setOpenViewModal] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerDetails, setCustomerDetails] =
    useState<UpdateCustomerPayload | null>(null);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'firstName',
      header: 'Customer Name',
      cell: ({ row: { original } }) => (
        <div className="">
          {original.firstName} {original.lastName}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Telephone',
      cell: ({ row: { original } }) => (
        <PhoneFlag phoneNumber={original.phone} />
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row: { original } }) => <div className="">{original.email}</div>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row: { original } }) => <div>{original.type}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => {
        const status = original.status || 'enabled'; // Default to enabled if status is not provided

        // Status color mapping based on the specific status values from validations.ts
        const statusColorMap: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          schedule: 'bg-blue-100 text-blue-800',
          complete: 'bg-green-100 text-green-800',
          enabled: 'bg-green-100 text-green-800',
          disabled: 'bg-red-100 text-red-800',
          available: 'bg-teal-100 text-teal-800',
          expired: 'bg-gray-100 text-gray-800',
          taken: 'bg-purple-100 text-purple-800',
        };

        const colorClass =
          statusColorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800'; // Default styling
        return (
          <div
            className={`px-3 py-1 rounded-full w-fit text-xs font-medium ${colorClass}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
            {/* Capitalize first letter */}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row: { original } }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <i className="ri-more-2-fill text-gray-600"></i>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setOpenViewModal(original.uuid);
                  setIsViewOpen(true);
                }}
                className="cursor-pointer"
              >
                <i className="ri-eye-line mr-2"></i>
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOpenUpdateModal(original.uuid);
                  setCustomerDetails(original);
                  setIsEditOpen(true);
                }}
                className="cursor-pointer"
              >
                <i className="ri-edit-line mr-2"></i>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOpenDeleteModal(original.uuid);
                  setIsDeleteOpen(true);
                }}
                className="cursor-pointer text-red-600"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [debouncedSearch],
  });

  const filter: CustomerFilter = {
    page,
    limit,
    search: debouncedSearch || undefined,
  };
  const { data: customer, isLoading, error, refetch } = useGetAllCustomers(filter);

  const handleRowClick = (row: any) => {
    setOpenViewModal(row.uuid);
    setIsViewOpen(true);
  };

  return (
    <div>
      <Filter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataGrid
          columns={columns}
          data={customer?.data ?? []}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          pageSizeOptions={[10, 20, 50, 100]}
          {...tableProps(customer?.meta, customer?.data?.length)}
        />
      )}
      {openDeleteModal && (
        <DeleteModal
          customerID={openDeleteModal}
          open={isDeleteOpen}
          setOpen={setIsDeleteOpen}
        />
      )}
      {openUpdateModal && (
        <EditCustomer
          customer={customerDetails}
          customerId={openUpdateModal}
          open={isEditOpen}
          setOpen={setIsEditOpen}
        />
      )}
      {openViewModal && (
        <ViewCustomerSlider
          customerId={openViewModal}
          open={isViewOpen}
          setOpen={setIsViewOpen}
        />
      )}
    </div>
  );
};

export default TableComponents;
