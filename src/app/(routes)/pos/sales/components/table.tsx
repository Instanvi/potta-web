'use client';
import { Check } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useGetAllSalesReceipts } from '../hooks/useGetAllReceipts';
import { Filters, SalesReceipt } from '../utils/types';
import DynamicFilter from '@potta/components/dynamic-filter';
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
import { DataTable } from '@potta/components/ui/data-table';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';
import { exportRows } from '@/lib/export-file';


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
        <div className="truncate">
          {original.customer
            ? `${original.customer.firstName} ${original.customer.lastName}`.trim()
            : 'Walk-in'}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row: { original } }) => (
        <div className="">{original.paymentMethod || '—'}</div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Memo',
      cell: ({ row: { original } }) => (
        <div className="max-w-[14rem] truncate">{original.notes || '—'}</div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row: { original } }) => (
        <div className="tabular-nums">
          XAF {Number(original.totalAmount || 0).toLocaleString()}
        </div>
      ),
    },
    {
      id: 'resolution',
      header: 'Resolution',
      cell: () => (
        <StatusBadge tone="success">
          <Check size={14} weight="bold" />
          Closed
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      header: '',
      cell: ({ row: { original } }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-[2px] p-2 hover:bg-black/[0.04]"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="ri-more-2-fill text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenViewModal(original.uuid);
                  setReceiptDetails(original);
                  setIsViewOpen(true);
                }}
                className="cursor-pointer"
              >
                <i className="ri-eye-line mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDeleteModal(original.uuid);
                  setReceiptDetails(original);
                  setIsDeleteOpen(true);
                }}
                className="cursor-pointer text-destructive"
              >
                <i className="ri-delete-bin-line mr-2" />
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
    <div className="flex flex-col gap-4">
      <ListToolbar
        className="items-center"
        actions={
          <>
            <Button
              text={'Export'}
              icon={<img src="/images/export.svg" alt="" />}
              theme="lightBlue"
              type={'button'}
              color={true}
              onClick={() =>
                void exportRows({
                  filename: 'sales',
                  rows: receiptsData,
                  columns: [
                    { key: 'receiptNumber', header: 'Receipt' },
                    {
                      key: 'saleDate',
                      header: 'Date',
                      value: (row) =>
                        row.saleDate ? new Date(row.saleDate).toLocaleDateString() : '',
                    },
                    {
                      key: 'customer',
                      header: 'Customer',
                      value: (row) =>
                        row.customer
                          ? `${row.customer.firstName} ${row.customer.lastName}`.trim()
                          : '',
                    },
                    { key: 'paymentMethod', header: 'Method' },
                    { key: 'notes', header: 'Memo' },
                    { key: 'totalAmount', header: 'Total' },
                    { key: 'paymentReference', header: 'Reference' },
                  ],
                })
              }
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
          className="w-full p-0"
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={receiptsData}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          {...tableProps(data?.meta, receiptsData.length)}
        
          storageKey="pos-sales-table"
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
