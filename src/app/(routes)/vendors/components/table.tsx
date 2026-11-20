'use client';
import React, { FC, useState } from 'react';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
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
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import KYCManagementModal from './KYCManagementModal';
import PaymentMethodsModal from './PaymentMethodsModal';
import { vendorApi } from '../utils/api';
import toast from 'react-hot-toast';

// KYC Button Component
const KYCButton = ({
  vendor,
  onRefresh,
}: {
  vendor: any;
  onRefresh: () => void;
}) => {
  const [isInitializing, setIsInitializing] = useState(false);

  // Check if vendor has KYC initialized
  const hasKYC = vendor.kyc && vendor.kyc.length > 0;

  const handleKYC = async () => {
    if (hasKYC) {
      // This will be handled by the parent component
      return 'open_modal';
    } else {
      // Initialize KYC directly for vendors without KYC
      setIsInitializing(true);
      try {
        await vendorApi.kyc.initialize(vendor.uuid);
        toast.success('KYC process initialized successfully!');
        // Refresh the table data
        onRefresh();
      } catch (error) {
        console.error('Failed to initialize KYC:', error);
        toast.error('Failed to initialize KYC process');
      } finally {
        setIsInitializing(false);
      }
    }
  };

  return (
    <button
      onClick={handleKYC}
      disabled={isInitializing}
      className={`flex items-center space-x-2 text-blue-600 hover:text-blue-800 underline ${
        isInitializing ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isInitializing ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span>Initializing...</span>
        </>
      ) : (
        <>
          <i className="ri-shield-check-line"></i>
          <span>{hasKYC ? 'Manage KYC' : 'Initialize KYC'}</span>
        </>
      )}
    </button>
  );
};

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

  // KYC Modal states
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [selectedVendorForKyc, setSelectedVendorForKyc] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Payment Methods Modal states
  const [paymentMethodsModalOpen, setPaymentMethodsModalOpen] = useState(false);
  const [selectedVendorForPaymentMethods, setSelectedVendorForPaymentMethods] =
    useState<{
      id: string;
      name: string;
    } | null>(null);

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

  // Helper function to get KYC status badge
  const getKYCStatusBadge = (
    isKYCVerified: boolean,
    hasKYCInitialized?: boolean
  ) => {
    if (isKYCVerified) {
      return (
        <Badge className="text-green-600 uppercase w-fit flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    } else if (hasKYCInitialized === true) {
      return (
        <Badge className="text-yellow-600 uppercase w-fit flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    } else {
      // Show "Not Initialized" for vendors without KYC
      return (
        <Badge className="text-gray-600 uppercase w-fit flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Not Initialized
        </Badge>
      );
    }
  };

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
        getKYCStatusBadge(original.isKYCVerified, original.hasKYCInitialized),
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
      id: 'kyc',
      header: 'KYC Status',
      cell: ({ row: { original } }) => {
        const handleKYC = () => {
          // Check if vendor has KYC initialized
          const hasKYC = original.kyc && original.kyc.length > 0;

          if (hasKYC) {
            // Open modal for vendors with existing KYC
            setSelectedVendorForKyc({
              id: original.uuid,
              name: original.name,
            });
            setKycModalOpen(true);
          } else {
            // Initialize KYC directly for vendors without KYC
            handleInitializeKYC(original.uuid);
          }
        };

        return (
          <button
            onClick={handleKYC}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 underline"
          >
            <i className="ri-shield-check-line"></i>
            <span>
              {original.kyc && original.kyc.length > 0
                ? 'Manage KYC'
                : 'Initialize KYC'}
            </span>
          </button>
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

              <DropdownMenuItem
                onClick={() => {
                  setSelectedVendorForPaymentMethods({
                    id: original.uuid,
                    name: original.name,
                  });
                  setPaymentMethodsModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <i className="ri-bank-card-line mr-2"></i>
                Payment Methods
              </DropdownMenuItem>
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

  // Function to handle KYC initialization
  const handleInitializeKYC = async (vendorId: string) => {
    // Show loading toast
    const loadingToast = toast.loading('Initializing KYC...');

    try {
      await vendorApi.kyc.initialize(vendorId);
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('KYC process initialized successfully!');
      // Refresh the table data
      refetch();
    } catch (error) {
      console.error('Failed to initialize KYC:', error);
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error('Failed to initialize KYC process');
    }
  };

  // Filter data based on search, status, and KYC
  const filteredData = useMemo(() => {
    if (!vendor?.data) return [];

    let filtered = vendor.data;

    // Add computed hasKYCInitialized field based on new backend structure
    // Backend now includes 'kyc' field when KYC exists, omits it when not initialized
    //
    // NEW BACKEND LOGIC:
    // - hasKYCInitialized: true when vendor.kyc exists and has items
    // - hasKYCInitialized: false when vendor.kyc is missing or empty
    // - isKYCVerified: true when KYC is approved
    // - isKYCVerified: false when KYC is pending or not verified
    //
    filtered = filtered.map((vendor: any) => {
      // Determine KYC initialization status based on new backend structure
      // Backend now includes 'kyc' field when KYC exists, omits it when not initialized
      const hasKYCInitialized = vendor.kyc && vendor.kyc.length > 0;

      return {
        ...vendor,
        hasKYCInitialized,
      };
    });

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (vendor: any) => vendor.status === statusFilter
      );
    }

    // Filter by KYC status
    if (kycFilter !== 'all') {
      filtered = filtered.filter((vendor: any) => {
        if (kycFilter === 'verified') {
          return vendor.isKYCVerified === true;
        } else if (kycFilter === 'pending') {
          // Show vendors that have KYC initialized but not yet verified
          return (
            vendor.isKYCVerified === false && vendor.hasKYCInitialized === true
          );
        } else if (kycFilter === 'not_initialized') {
          // Show vendors that haven't started KYC process
          return vendor.hasKYCInitialized === false;
        }
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
      <DataGrid
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        showPagination={true}
        pageSize={limit}
        pageSizeOptions={[10, 20, 50, 100]}
        manualPagination={!!vendor?.meta}
        currentPage={page}
        pageCount={vendor?.meta?.totalPages || 1}
        totalItems={vendor?.meta?.totalItems || filteredData.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      <DeleteModal
        vendorID={openDeleteModal || ''}
        open={isDeleteOpen}
        setOpen={setIsDeleteOpen}
      />
      <EditVendor
        vendor={vendorDetails}
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
      <KYCManagementModal
        isOpen={kycModalOpen}
        onClose={() => {
          setKycModalOpen(false);
          setSelectedVendorForKyc(null);
        }}
        vendorId={selectedVendorForKyc?.id || ''}
        vendorName={selectedVendorForKyc?.name || ''}
        onKYCStatusChange={handleRefreshVendors}
      />
      <PaymentMethodsModal
        isOpen={paymentMethodsModalOpen}
        onClose={() => {
          setPaymentMethodsModalOpen(false);
          setSelectedVendorForPaymentMethods(null);
        }}
        vendorId={selectedVendorForPaymentMethods?.id || ''}
        vendorName={selectedVendorForPaymentMethods?.name || ''}
        onPaymentMethodChange={handleRefreshVendors}
      />
    </div>
  );
};

export default TableComponents;
