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
import { useMemo } from 'react';

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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Build filter with search
  const filter: VendorFilter = {
    page,
    limit,
    search: searchValue || undefined,
  };
  const { data: vendor, isLoading, error, refetch } = useGetAllVendors(filter);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  // Function to refresh vendor data
  const handleRefreshVendors = () => {
    refetch();
  };

  // Filter data based on search, status, and KYC
  const filteredData = useMemo(() => {
    if (!vendor?.data) return [];

    let filtered = vendor.data;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (vendor: any) => vendor.status === statusFilter
      );
    }

    // Filter by KYC status
    if (kycFilter !== 'all') {
      filtered = filtered.filter((vendor: any) => {
        if (kycFilter === 'verified') return vendor.isKYCVerified === true;
        if (kycFilter === 'unverified') return vendor.isKYCVerified !== true;
        return true;
      });
    }

    // Filter by search value
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (vendor: any) =>
          vendor.name.toLowerCase().includes(searchLower) ||
          (vendor.email && vendor.email.toLowerCase().includes(searchLower)) ||
          (vendor.phone && vendor.phone.toLowerCase().includes(searchLower)) ||
          (vendor.industry &&
            vendor.industry.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [vendor?.data, statusFilter, kycFilter, searchValue]);

  const handleRowClick = (row: any) => {
    setOpenViewModal(row.uuid);
    setIsViewOpen(true);
  };

  if (error)
    return (
      <div className="mt-10">
        <Filter
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          onSearchClear={() => setSearchValue('')}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          kycFilter={kycFilter}
          onKycFilterChange={setKycFilter}
        />
        <div className="min-h-60 items-center flex justify-center">
          <p className="text-red-600 text-center">
            Error fetching vendors: {error.message}
          </p>
        </div>
      </div>
    );
  return (
    <div className="mt-10">
      <Filter
        searchValue={searchValue}
        onSearchChange={(e) => setSearchValue(e.target.value)}
        onSearchClear={() => setSearchValue('')}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        kycFilter={kycFilter}
        onKycFilterChange={setKycFilter}
      />
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        showPagination={true}
        pageSize={limit}
        pageSizeOptions={[10, 20, 50, 100]}
        onRowClick={handleRowClick}
        manualPagination
        pageCount={vendor?.meta?.totalPages || 1}
        totalRows={vendor?.meta?.totalItems || filteredData.length}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          const next =
            typeof updater === 'function'
              ? updater({ pageIndex: page - 1, pageSize: limit })
              : updater;
          if (next.pageSize !== limit) handlePageSizeChange(next.pageSize);
          else handlePageChange(next.pageIndex + 1);
        }}
      />
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
