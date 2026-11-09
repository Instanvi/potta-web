'use client';
import React, { ComponentProps, useState } from 'react';
import { DataTable } from '@potta/components/ui/data-table';
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import Flag from 'react-world-flags';

import Filter from './filters';
import useGetAllVendors from '../hooks/useGetAllVendors';
import ViewVendorSlider from './viewVendorSlider.tsx';

import EditVendor from './updateVendorSlider';
import DeleteModal from './deleteModal';
import { VendorFilter } from '../utils/types';

import { UpdateVendorPayload, updateVendorSchema } from '../utils/validations';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@potta/components/shadcn/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Can } from '@/components/auth/can';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState } from '../../_shared/states';

export const PhoneFlag = ({ phoneNumber }: { phoneNumber: string }) => {
  const phoneNumberObj = parsePhoneNumberFromString(phoneNumber);
  const countryCode = phoneNumberObj?.country;
  const number = phoneNumberObj?.number;
  return countryCode ? (
    <div className="flex items-center">
      <div className="">
        <img
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
  const [vendorDetails, setVendorDetails] =
    useState<UpdateVendorPayload | null>(null);

  // Filter states
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: ' text-yellow-600',
        icon: <Clock className="h-3 w-3" />,
      },
      APPROVED: {
        color: ' text-green-600',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      REJECTED: {
        color: ' text-red-600',
        icon: <XCircle className="h-3 w-3" />,
      },
      ACTIVE: {
        color: ' text-green-600',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      INACTIVE: {
        color: ' text-gray-600',
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={`${config.color} w-fit flex items-center gap-1`}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getKYCStatusBadge = (isKYCVerified: boolean) =>
    isKYCVerified ? (
      <Badge className="text-green-600 uppercase w-fit flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge className="text-yellow-600 uppercase w-fit flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Unverified
      </Badge>
    );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Vendor/ Company Name',
      cell: ({ row: { original } }) => (
        <div className="font-medium">{original.name}</div>
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
      cell: ({ row: { original } }) => (
        <div className="text-sm">{original.email || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => getStatusBadge(original.status),
    },
    {
      accessorKey: 'isKYCVerified',
      header: 'KYC Status',
      cell: ({ row: { original } }) =>
        getKYCStatusBadge(original.isKYCVerified),
    },
    {
      accessorKey: 'industry',
      header: 'Industry',
      cell: ({ row: { original } }) => (
        <div className="text-sm">{original.industry || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'openingBalance',
      header: 'Balance',
      cell: ({ row: { original } }) => (
        <div className="text-sm">
          {original.openingBalance !== null ? original.currency : ''}
          {original.openingBalance !== null ? original.openingBalance : 'N/A'}
        </div>
      ),
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  setOpenViewModal(original.uuid);
                  setIsViewOpen(true);
                }}
                className="cursor-pointer"
              >
                <i className="ri-eye-line mr-2"></i>
                View Details
              </DropdownMenuItem>
              <Can resource="Vendor" action="update">
                <DropdownMenuItem
                  onClick={() => {
                    setOpenUpdateModal(original.uuid);
                    setVendorDetails(original);
                    setIsEditOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Edit Vendor
                </DropdownMenuItem>
              </Can>
              <Can resource="Vendor" action="remove">
                <DropdownMenuItem
                  onClick={() => {
                    setOpenDeleteModal(original.uuid);
                    setIsDeleteOpen(true);
                  }}
                  className="cursor-pointer text-red-600"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Delete Vendor
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [statusFilter, kycFilter, debouncedSearch],
  });

  const filter: VendorFilter = {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    isKYCVerified: kycFilter === 'all' ? undefined : kycFilter === 'verified',
  };
  const { data: vendor, isLoading, error, refetch } = useGetAllVendors(filter);

  // Function to refresh vendor data
  const handleRefreshVendors = () => {
    refetch();
  };

  const handleRowClick = (row: any) => {
    setOpenViewModal(row.uuid);
    setIsViewOpen(true);
  };

  return (
    <div>
      <Filter
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue('')}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        kycFilter={kycFilter}
        onKycFilterChange={setKycFilter}
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={vendor?.data ?? []}
          isLoading={isLoading}
          pageSizeOptions={[10, 20, 50, 100]}
          onRowClick={handleRowClick}
          {...tableProps(vendor?.meta, vendor?.data?.length)}
        />
      )}
      <DeleteModal
        vendorID={openDeleteModal || ''}
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
      />
      <EditVendor
        vendor={vendorDetails as ComponentProps<typeof EditVendor>['vendor']}
        vendorId={openUpdateModal || ''}
        open={isEditOpen}
        setOpen={setIsEditOpen}
      />
      <ViewVendorSlider
        vendorId={openViewModal || ''}
        open={isViewOpen}
        setOpen={setIsViewOpen}
        onVendorDataChange={handleRefreshVendors}
      />
    </div>
  );
};

export default TableComponents;
