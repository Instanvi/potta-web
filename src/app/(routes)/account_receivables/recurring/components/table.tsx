'use client';
import React, { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical } from 'lucide-react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { DataTable } from '@potta/components/ui/data-table';
import DynamicFilter from '@potta/components/dynamic-filter';
import Button from '@potta/components/button';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { ErrorState, ListToolbar } from '../../../_shared/states';
import { IFilter } from '../_utils/types';
import useGetAllInvoice from '../_hooks/useGetAllInvoice';
import ModalInvoice from './modal';

// Define types based on the API response
interface Invoice {
  uuid: string;
  invoiceId: string;
  issuedDate: string;
  dueDate: string;
  invoiceType: string;
  invoiceTotal: number;
  status: string;
  notes: string;
  customer: {
    firstName: string;
    lastName: string;
  } | null;
}

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Issued', value: 'issued' },
  { label: 'Paid', value: 'paid' },
  { label: 'Approved', value: 'approved' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Archived', value: 'archived' },
];

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'overdue':
      return 'text-destructive';
    case 'paid':
      return 'text-primary';
    default:
      return 'text-muted-foreground';
  }
};

const formatDate = (date: string) => {
  const today = new Date();
  const inputDate = new Date(date);

  if (
    today.getDate() === inputDate.getDate() &&
    today.getMonth() === inputDate.getMonth() &&
    today.getFullYear() === inputDate.getFullYear()
  ) {
    return 'Today';
  }
  return inputDate.toLocaleDateString();
};

const InvoiceTable = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [statusFilter],
  });

  const filter: IFilter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
    status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
  };

  const { data, isLoading, error, refetch } = useGetAllInvoice(filter);

  // /invoice/filter has no searchable columns, so search applies to the loaded page only.
  const rows = useMemo(() => {
    const list: Invoice[] = data?.data ?? [];
    const term = searchValue.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (row) =>
        row.invoiceId?.toLowerCase().includes(term) ||
        row.notes?.toLowerCase().includes(term) ||
        (row.customer &&
          `${row.customer.firstName} ${row.customer.lastName}`
            .toLowerCase()
            .includes(term))
    );
  }, [data?.data, searchValue]);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'issuedDate',
      header: 'Date',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(original.issuedDate)}
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row: { original } }) => (
        <div className="text-sm font-medium">
          {original.customer
            ? `${original.customer.firstName} ${original.customer.lastName}`
            : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: 'invoiceId',
      header: 'ID',
      cell: ({ row: { original } }) => (
        <div className="text-sm text-muted-foreground">
          {original.invoiceId}
        </div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Title',
      cell: ({ row: { original } }) => (
        <div className="text-sm">{original.notes || 'No title'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row: { original } }) => (
        <div className={`text-sm capitalize ${getStatusStyle(original.status)}`}>
          {original.status.toLowerCase()}
        </div>
      ),
    },
    {
      accessorKey: 'invoiceTotal',
      header: 'Amount',
      cell: ({ row: { original } }) => (
        <div className="text-sm">
          XAF{' '}
          {original.invoiceTotal.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      id: 'resolution',
      header: 'Resolution',
      cell: () => (
        <div className="flex justify-center border-r pr-4">
          <div className="flex w-full items-center gap-3 border border-primary/40 bg-brand-subtle px-3 py-2 text-primary">
            <div className="flex size-4 items-center justify-center rounded-full bg-primary text-white">
              <Icon icon="material-symbols:check" width="20" height="20" />
            </div>
            Closed
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex justify-center">
          <button className="rounded p-1 hover:bg-accent">
            <MoreVertical size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ListToolbar
        actions={
          <>
            <Button
              text={'Export'}
              icon={<i className="ri-upload-2-line"></i>}
              theme="lightBlue"
              type={'button'}
            />
            <Link href={'/account_receivables/recurring/new'}>
              <Button
                text={'Create Invoice'}
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
          onSearchChange={(e) => setSearchValue(e.target.value)}
          onSearchClear={() => setSearchValue('')}
          searchPlaceholder="Search by customer, ID, or title..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: statusOptions,
              value: statusFilter,
              onChange: setStatusFilter,
              selectClassName: 'min-w-[120px]',
            },
          ]}
          className="p-0"
        />
      </ListToolbar>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection
          {...tableProps(data?.meta, data?.data?.length)}
        />
      )}
      <ModalInvoice isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default InvoiceTable;
