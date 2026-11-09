'use client';
import React, { useState } from 'react';
import { DateRangePicker, DateRangeValue } from '@potta/components/ui/date-picker';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState, ListToolbar } from '../../../_shared/states';
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

/** 'YYYY-MM-DD' -> ISO instant of that local day's first/last millisecond. */
const localDayBoundary = (day: string, edge: 'start' | 'end') => {
  const [y, m, d] = day.split('-').map(Number);
  return (
    edge === 'start'
      ? new Date(y, m - 1, d, 0, 0, 0, 0)
      : new Date(y, m - 1, d, 23, 59, 59, 999)
  ).toISOString();
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
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRangeValue>({});
  const [sortBy, setSortBy] = useState('createdAt:DESC');

  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);
  const saleFrom = dateRange.from
    ? localDayBoundary(dateRange.from, 'start')
    : undefined;
  const saleTo = dateRange.from
    ? localDayBoundary(dateRange.to || dateRange.from, 'end')
    : undefined;

  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [methodFilter, sortBy, debouncedSearch, saleFrom, saleTo],
  });

  const [sortColumn, sortOrder] = sortBy.split(':') as [
    NonNullable<Filters['sortBy']>,
    NonNullable<Filters['sortOrder']>,
  ];
  const filter: Filters = {
    limit,
    page,
    sortBy: sortColumn,
    sortOrder,
    paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
    search: debouncedSearch || undefined,
    saleFrom,
    saleTo,
  };

  // Fetch receipts data using the hook
  const { data, isLoading, error, refetch } = useGetAllSalesReceipts(filter);

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
      key: 'method',
      label: 'Method',
      options: [
        { label: 'All Methods', value: 'all' },
        { label: 'Cash', value: 'CASH' },
        { label: 'Mobile Money', value: 'MOBILE_MONEY' },
        { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
        { label: 'Credit Card', value: 'CREDIT_CARD' },
        { label: 'Digital Wallet', value: 'DIGITAL_WALLET' },
        { label: 'Credit', value: 'CREDIT' },
        { label: 'Other', value: 'OTHER' },
      ],
      value: methodFilter,
      onChange: setMethodFilter,
      selectClassName: 'min-w-[140px]',
    },
    {
      key: 'sort',
      label: 'Sort by',
      options: [
        { label: 'Newest First', value: 'createdAt:DESC' },
        { label: 'Oldest First', value: 'createdAt:ASC' },
        { label: 'Sale date (newest)', value: 'saleDate:DESC' },
        { label: 'Sale date (oldest)', value: 'saleDate:ASC' },
        { label: 'Amount (high to low)', value: 'totalAmount:DESC' },
        { label: 'Amount (low to high)', value: 'totalAmount:ASC' },
      ],
      value: sortBy,
      onChange: setSortBy,
      selectClassName: 'min-w-[140px]',
    },
  ];

  const receiptsData: ResponseSalesReceipt[] = data?.data ?? [];

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
          {original.customer
            ? `${original.customer.firstName} ${original.customer.lastName}`
            : 'Walk-in'}
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
            <div className="flex w-full items-center gap-3 border border-primary/40 bg-brand-subtle px-3 py-2 text-primary">
              <div className="flex size-4 items-center justify-center rounded-full bg-primary text-white">
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

  return (
    <>
      <ListToolbar
        actions={
          <>
            <Button
              text={'Export'}
              icon={<img src="/images/export.svg" />}
              theme="lightBlue"
              type={'button'}
            />
            <Link href={'/account_receivables/sales_receipts/new'}>
              <Button
                text={'Create Sale'}
                icon={<i className="ri-file-add-line"></i>}
                theme="default"
                type={'button'}
              />
            </Link>
          </>
        }
      >
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          searchPlaceholder="Search receipts by customer, ID, or memo..."
          filters={filterConfig}
          className="p-0"
        />
        <DateRangePicker
          className="w-auto min-w-[240px]"
          placeholder="Sale date: all"
          clearable
          value={dateRange}
          onChange={setDateRange}
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataGrid
          columns={columns}
          data={receiptsData}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          {...tableProps(data?.meta, data?.data?.length)}
        />
      )}

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
    </>
  );
};

export default SaleTable;
