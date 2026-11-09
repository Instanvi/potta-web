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
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';


/** saleDate range for a date preset, as a nestjs-paginate $btw filter (local days). */
const saleDateFilter = (range: string): string | undefined => {
  if (range === 'all') return undefined;
  const now = new Date();
  const day = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  const endOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const bounds: Record<string, [Date, Date]> = {
    today: [day(0), endOf(day(0))],
    yesterday: [day(-1), endOf(day(-1))],
    this_week: [day(-now.getDay()), endOf(day(0))],
    this_month: [new Date(now.getFullYear(), now.getMonth(), 1), endOf(day(0))],
  };
  const b = bounds[range];
  return b ? `$btw:${b[0].toISOString()},${b[1].toISOString()}` : undefined;
};

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
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:DESC');
  const search = useDebouncedValue(searchValue.trim(), 300);

  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [sortBy, search, dateFilter],
  });
  const [sortColumn, sortOrder] = sortBy.split(':') as [Filters['sortBy'], Filters['sortOrder']];

  const saleDate = saleDateFilter(dateFilter);
  const filter: Filters = {
    limit,
    page,
    sortBy: sortColumn,
    sortOrder,
    ...(search ? { search } : {}),
    ...(saleDate ? { 'filter.saleDate': saleDate } : {}),
  };

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
        { label: 'Recently Updated', value: 'updatedAt:DESC' },
        { label: 'Sale date (newest)', value: 'saleDate:DESC' },
        { label: 'Amount (highest)', value: 'totalAmount:DESC' },
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
      cell: () => (
        <StatusBadge tone="success">
          <Icon icon="material-symbols:check" width="14" height="14" />
          Closed
        </StatusBadge>
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
                className="cursor-pointer text-destructive"
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

  const receiptsData: ResponseSalesReceipt[] = data?.data || [];

  return (
    <div>
      <ListToolbar
        actions={
          <>
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
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataGrid
          columns={columns}
          data={receiptsData}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          {...tableProps(data?.meta, receiptsData.length)}
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
    </div>
  );
};

export default SaleTable;
