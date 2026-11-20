'use client';
import React, { useState } from 'react';
import { useGetAllSalesReceipts } from '../hooks/useGetAllReceipts';
import { Filters, SalesReceipt } from '../utils/types';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Icon } from '@iconify/react';
import { CloudDownload, FileDown } from 'lucide-react';
import ViewReceiptSlider from './viewSlider';
import DeleteModal from './deleteModal';
import Button from '@potta/components/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@potta/components/shadcn/dropdown';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';

// Updated type to match the actual response structure
type ResponseSalesReceipt = {
  uuid: string;
  branchId: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  updatedAt: string;
  saleReceiptId: string;
  saleDate: string;
  totalAmount: number;
  taxAmount: number;
  receiptNumber: string;
  notes: string;
  paymentReference: string;
  discountAmount: number;
  paymentMethod: string;
  salePerson: {
    uuid: string;
    name: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  customer: {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    customerId: string;
    [key: string]: any;
  };
  lineItems: Array<{
    uuid: string;
    description: string;
    quantity: number;
    discountType: string;
    unitPrice: number;
    discountCap: number;
    totalAmount: number;
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number | null;
    [key: string]: any;
  }>;
};

const SaleTable = () => {
  const [openViewModal, setOpenViewModal] = useState<string | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [receiptDetails, setReceiptDetails] =
    useState<ResponseSalesReceipt | null>(null);

  // Filter state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:DESC');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Set up filter state with pagination
  const filter: Filters = {
    limit,
    page,
    sortOrder: 'ASC',
    sortBy: 'createdAt',
  };

  // Fetch receipts data using the hook
  const { data, isLoading, error } = useGetAllSalesReceipts(filter);

  const handleRowClick = (row: ResponseSalesReceipt) => {
    setOpenViewModal(row.uuid);
    setIsViewOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchValue('');
  };

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Completed', value: 'completed' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      selectClassName: 'min-w-[120px]',
    },
    {
      key: 'date',
      label: 'Date',
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'this_week' },
        { label: 'This Month', value: 'this_month' },
      ],
      value: dateFilter,
      onChange: setDateFilter,
      selectClassName: 'min-w-[140px]',
    },
    {
      key: 'sort',
      label: 'Sort by',
      options: [
        { label: 'Newest First', value: 'createdAt:DESC' },
        { label: 'Oldest First', value: 'createdAt:ASC' },
        { label: 'Sale Date', value: 'saleDate:DESC' },
        { label: 'Amount High to Low', value: 'totalAmount:DESC' },
        { label: 'Amount Low to High', value: 'totalAmount:ASC' },
      ],
      value: sortBy,
      onChange: setSortBy,
      selectClassName: 'min-w-[140px]',
    },
  ];

  const columns: ColumnDef<ResponseSalesReceipt>[] = [
    {
      accessorKey: 'saleDate',
      header: 'Date',
      cell: ({ row: { original } }) => (
        <div className="">
          {new Date(original.saleDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: () => <div className="">Sale</div>,
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row: { original } }) => (
        <div className="">
          {original.customer.firstName} {original.customer.lastName}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row: { original } }) => (
        <div className="">{original.paymentMethod}</div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Memo',
      cell: ({ row: { original } }) => (
        <div className="">{original.notes || '-'}</div>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: () => <div className="">XAF 0</div>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row: { original } }) => (
        <div className="">XAF {original.totalAmount.toLocaleString()}</div>
      ),
    },
    {
      id: 'download',
      header: '',
      cell: () => (
        <div className="">
          <FileDown />
        </div>
      ),
    },
    {
      id: 'resolution',
      header: 'Resolution',
      cell: () => {
        const status = 'Closed';
        return (
          <div className="border-r pr-4 flex justify-center">
            <div className="flex items-center gap-3  w-full px-3 py-2 border border-green-500 bg-green-50 text-green-700">
              <div className="flex items-center justify-center text-white bg-green-700 rounded-full size-4">
                <Icon icon="material-symbols:check" width="20" height="20" />
              </div>
              {status}
            </div>
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
                  setReceiptDetails(original);
                  setIsViewOpen(true);
                }}
                className="cursor-pointer"
              >
                <i className="ri-eye-line mr-2"></i>
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOpenDeleteModal(original.uuid);
                  setReceiptDetails(original);
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

  // Error handling
  if (error) {
    return (
      <div className="mt-4">
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Search receipts by customer, ID, or memo..."
          filters={filterConfig}
        />  
        <div className="min-h-60 items-center flex justify-center">
          <p className="text-red-600 text-center">
            An error occurred while fetching receipts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Use the fetched data or an empty array if data is not available
  const receiptsData = data?.data || [];

  return (
    <div className="">
      <div className="flex justify-between items-center w-full">
        {/* Left side - Dynamic Filter */}
        <div className="flex-1">
          <DynamicFilter
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            searchPlaceholder="Search receipts by customer, ID, or memo..."
            filters={filterConfig}
            className="p-0 bg-transparent"
          />
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            text={'Export'}
            icon={<img src="/images/export.svg" />}
            theme="lightBlue"
            type={'button'}
            color={true}
          />
          <Link href={'/pos/sales/new'}>
            <Button
              text={'Create Sale'}
              icon={<i className="ri-file-add-line"></i>}
              theme="default"
              type={'button'}
            />
          </Link>
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={receiptsData}
        onRowClick={handleRowClick}
        isLoading={isLoading}
      />

      {/* Add your modal components here when implemented */}

      {openDeleteModal && (
        <DeleteModal
          recieptID={openDeleteModal}
          open={isDeleteOpen}
          setOpen={setIsDeleteOpen}
        />
      )}
      {openViewModal && (
        <ViewReceiptSlider
          receiptId={openViewModal}
          open={isViewOpen}
          setOpen={setIsViewOpen}
        />
      )}
    </div>
  );
};

export default SaleTable;
