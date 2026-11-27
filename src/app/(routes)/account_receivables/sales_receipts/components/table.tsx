'use client';
import { Check } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { DateRangePicker, DateRangeValue } from '@potta/components/ui/date-picker';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ErrorState, ListToolbar } from '../../../_shared/states';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { exportRows } from '@/lib/export-file';
import { sendPartyDocument } from '@/lib/document-send';
import type { DocumentChannel } from '@/components/document-channel-menu';
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
  DropdownMenuSeparator,
} from '@potta/components/shadcn/dropdown';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';
import { usePaymentMethods } from '@potta/app/(routes)/accounting/payment-methods/hooks';
import { paymentMethodDisplayLabel } from '@/lib/payment-method-labels';

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
  const [sendTarget, setSendTarget] = useState<{
    receipt: ResponseSalesReceipt;
    channel: DocumentChannel;
  } | null>(null);
  const [sending, setSending] = useState(false);

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
  const { data: paymentMethodsData } = usePaymentMethods({ page: 1, limit: 100 });
  const orgPaymentMethods = (paymentMethodsData?.data ?? []).map((m) => ({
    code: m.code,
    name: m.name,
  }));
  const methodLabel = (code?: string | null) =>
    paymentMethodDisplayLabel(code, orgPaymentMethods);

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

  const { table, onTableChange } = useDataTableHandle<ResponseSalesReceipt>();
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
        <div className="">{methodLabel(original.paymentMethod)}</div>
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
      id: 'resolution',
      header: 'Resolution',
      cell: () => {
        const status = 'Closed';
        return (
          <div className="border-r pr-4 flex justify-center">
            <div className="flex w-full items-center gap-3 border border-primary/40 bg-brand-subtle px-3 py-2 text-primary">
              <div className="flex size-4 items-center justify-center rounded-full bg-primary text-white">
                <Check size={20} weight="bold" />
              </div>
              {status}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      header: 'Actions',
      cell: ({ row: { original } }) => {
        const customerEmail = (original.customer?.email || '').trim();
        const customerPhone = (original.customer?.phone || '').trim();
        const hasCustomer = Boolean(original.customer);

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <i className="ri-more-2-fill text-gray-600"></i>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                {hasCustomer ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={!customerEmail || sending}
                      title={
                        customerEmail
                          ? `Email download link to ${customerEmail}`
                          : 'Add a customer email first'
                      }
                      onClick={() => {
                        if (!customerEmail) return;
                        setSendTarget({ receipt: original, channel: 'email' });
                      }}
                      className="cursor-pointer"
                    >
                      <i className="ri-mail-line mr-2"></i>
                      <span className="flex min-w-0 flex-col">
                        <span>Send by email</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {customerEmail || 'No email on file'}
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!customerPhone || sending}
                      title={
                        customerPhone
                          ? `Text download link to ${customerPhone}`
                          : 'Add a customer phone first'
                      }
                      onClick={() => {
                        if (!customerPhone) return;
                        setSendTarget({ receipt: original, channel: 'sms' });
                      }}
                      className="cursor-pointer"
                    >
                      <i className="ri-message-2-line mr-2"></i>
                      <span className="flex min-w-0 flex-col">
                        <span>Send by SMS</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {customerPhone || 'No phone on file'}
                        </span>
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
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
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ListToolbar
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {table ? <DataTableViewOptions table={table} /> : null}
            <Button
              text={'Export'}
              icon={<img src="/images/export.svg" alt="" />}
              theme="lightBlue"
              type={'button'}
              onClick={() =>
                void exportRows({
                  filename: 'sales-receipts',
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
            <Link href={'/account_receivables/sales_receipts/new'}>
              <Button
                text={'Create Sale'}
                icon={<i className="ri-file-add-line"></i>}
                theme="default"
                type={'button'}
              />
            </Link>
          </div>
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
          className="w-auto min-w-[220px]"
          placeholder="Sale date: all"
          clearable
          value={dateRange}
          onChange={setDateRange}
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          onTableChange={onTableChange}
          columns={columns}
          data={receiptsData}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          {...tableProps(data?.meta, data?.data?.length)}
        
          storageKey="sales-receipts-table"
        />
      )}

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
      <ConfirmModal
        open={Boolean(sendTarget)}
        title={
          sendTarget?.channel === 'sms'
            ? 'Send receipt by SMS?'
            : 'Send receipt by email?'
        }
        message={
          sendTarget?.channel === 'sms'
            ? `Text a download link for receipt ${
                sendTarget.receipt.receiptNumber ||
                sendTarget.receipt.saleReceiptId
              } to ${sendTarget.receipt.customer?.phone?.trim() || 'the customer'}?`
            : `Email a download link for receipt ${
                sendTarget?.receipt.receiptNumber ||
                sendTarget?.receipt.saleReceiptId ||
                ''
              } to ${sendTarget?.receipt.customer?.email?.trim() || 'the customer'}?`
        }
        confirmText="Send"
        isLoading={sending}
        onClose={() => {
          if (!sending) setSendTarget(null);
        }}
        onConfirm={() => {
          if (!sendTarget) return;
          const { receipt, channel } = sendTarget;
          const email = (receipt.customer?.email || '').trim();
          const phone = (receipt.customer?.phone || '').trim();
          setSending(true);
          void sendPartyDocument('sales_receipt', receipt.uuid, {
            channel,
            to: channel === 'email' ? email : undefined,
            phone: channel === 'sms' ? phone : undefined,
          })
            .then((res) => {
              toast.success(
                res.channel === 'sms'
                  ? `Receipt texted to ${res.to}`
                  : `Receipt emailed to ${res.to}`,
              );
              setSendTarget(null);
            })
            .catch((err: unknown) => {
              const message =
                err && typeof err === 'object' && 'response' in err
                  ? String(
                      (
                        err as {
                          response?: { data?: { message?: string } };
                        }
                      ).response?.data?.message || '',
                    )
                  : '';
              toast.error(message || 'Failed to send receipt download link');
            })
            .finally(() => setSending(false));
        }}
      />
    </div>
  );
};

export default SaleTable;
