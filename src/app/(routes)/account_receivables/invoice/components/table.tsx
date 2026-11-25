'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import { ColumnDef } from '@tanstack/react-table';
import { DateRangePicker } from '@potta/components/ui/date-picker';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  DocumentMasterDetail,
  DocumentListPanel,
  DocumentListRow,
} from '@potta/components/document-master-detail';
import Button from '@potta/components/button';
import DynamicFilter from '@potta/components/dynamic-filter';
import { ErrorState, ListToolbar } from '../../../_shared/states';
import { Skeleton } from '@potta/components/ui/loaders';
import { IFilter } from '../_utils/types';
import useGetAllInvoice from '../_hooks/useGetAllInvoice';
import { useInvoiceFilter } from '../_context/InvoiceFilterContext';
import {
  InvoiceDetailPanel,
  InvoiceDetailPreview,
} from './InvoiceDetailPanel';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';
import { ExportButton } from '@/components/export-button';
import type { ExportColumn } from '@/lib/export-file';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import { invoiceApi } from '../_utils/api';

const startOfLocalDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfLocalDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

interface LineItem {
  uuid: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate: number | null;
  taxAmount: number | null;
  discountRate: number | null;
  discountAmount: number | null;
  discountType: string;
  discountCap: number;
}

interface Invoice {
  uuid: string;
  invoiceId: string;
  invoiceNumber?: string | null;
  code?: string;
  issuedDate: string;
  dueDate: string;
  invoiceType: string;
  invoiceTotal: number;
  status: string;
  notes: string;
  currency: string;
  taxRate: number | null;
  taxAmount: number | null;
  paymentMethod: string;
  billingAddress: string;
  shippingAddress: string | null;
  paymentTerms: string | null;
  paymentReference: string | null;
  lineItems: LineItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
}

const statusClass = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PAID':
    case 'APPROVED':
      return 'text-green-700';
    case 'OVERDUE':
    case 'REJECTED':
      return 'text-red-600';
    case 'ISSUED':
      return 'text-yellow-700';
    default:
      return 'text-muted-foreground';
  }
};

const customerLabel = (invoice: Invoice) =>
  invoice.customer
    ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
    : invoice.notes || 'No customer';

const INVOICE_EXPORT_COLUMNS: ExportColumn<Invoice>[] = [
  {
    key: 'invoiceNumber',
    header: 'Invoice number',
    value: (row) => row.invoiceNumber || row.invoiceId || '',
  },
  { key: 'customer', header: 'Customer', value: (row) => customerLabel(row) },
  { key: 'status', header: 'Status' },
  { key: 'currency', header: 'Currency', value: (row) => row.currency || '' },
  { key: 'invoiceTotal', header: 'Total', value: (row) => Number(row.invoiceTotal) },
  {
    key: 'issuedDate',
    header: 'Issued',
    value: (row) => (row.issuedDate ? moment(row.issuedDate).format('YYYY-MM-DD') : ''),
  },
  {
    key: 'dueDate',
    header: 'Due',
    value: (row) => (row.dueDate ? moment(row.dueDate).format('YYYY-MM-DD') : ''),
  },
];

const InvoiceTable = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const [searchValue, setSearchValue] = useState('');
  const { dateRange, setDateRange, statusFilter, setStatusFilter } =
    useInvoiceFilter();
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);
  const issuedFrom = dateRange?.from
    ? startOfLocalDay(dateRange.from).toISOString()
    : undefined;
  const issuedTo = dateRange?.from
    ? endOfLocalDay(dateRange.to ?? dateRange.from).toISOString()
    : undefined;
  const { page, limit, setPagination, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [statusFilter, debouncedSearch, issuedFrom, issuedTo],
  });

  const filter: IFilter = {
    limit,
    page,
    sortOrder: 'DESC',
    sortBy: 'createdAt',
    status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
    search: debouncedSearch || undefined,
    issuedFrom,
    issuedTo,
  };

  const { data, isLoading, error, refetch } = useGetAllInvoice(filter);
  const { table, onTableChange } = useDataTableHandle<Invoice>();

  const filteredData = useMemo(
    () =>
      (data?.data ?? []).filter(
        (invoice: Invoice) => invoice.invoiceType !== 'PROFORMA_INVOICE'
      ),
    [data?.data]
  );

  const fetchAllInvoices = useCallback(async () => {
    const all = await fetchAllPages<Invoice>((p, l) =>
      invoiceApi.getAll({ ...filter, page: p, limit: l })
    );
    return all.filter((invoice) => invoice.invoiceType !== 'PROFORMA_INVOICE');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch, issuedFrom, issuedTo]);

  const selectedFromList = useMemo(
    () => filteredData.find((row: Invoice) => row.uuid === selectedId) ?? null,
    [filteredData, selectedId]
  );

  const setSelectedId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set('id', id);
      else params.delete('id');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Draft', value: 'draft' },
        { label: 'Issued', value: 'issued' },
        { label: 'Paid', value: 'paid' },
        { label: 'Approved', value: 'approved' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Archived', value: 'archived' },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
      selectClassName: 'min-w-[120px]',
    },
  ];

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice',
        cell: ({ row: { original } }) => (
          <span className="font-medium text-foreground">
            {original.invoiceNumber || original.invoiceId}
          </span>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row: { original } }) => (
          <span className="truncate">{customerLabel(original)}</span>
        ),
      },
      {
        accessorKey: 'issuedDate',
        header: 'Issued',
        cell: ({ row: { original } }) => (
          <span>{moment(original.issuedDate).format('MMM DD, YYYY')}</span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due',
        cell: ({ row: { original } }) => (
          <span>{moment(original.dueDate).format('MMM DD, YYYY')}</span>
        ),
      },
      {
        accessorKey: 'invoiceTotal',
        header: 'Total',
        cell: ({ row: { original } }) => (
          <span className="tabular-nums">
            {Number(original.invoiceTotal).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row: { original } }) => (
          <span className={statusClass(original.status)}>{original.status}</span>
        ),
      },
    ],
    []
  );

  const { pageCount } = tableProps(data?.meta, data?.data?.length);

  const list = (
    <DocumentListPanel
      header={
        <>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <i className="ri-arrow-left-line" />
              All invoices
            </button>
            <Link
              href="/account_receivables/invoice/new"
              className="inline-flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Create invoice"
              title="Create invoice"
            >
              <i className="ri-add-line text-lg" />
            </Link>
          </div>
          <DynamicFilter
            searchValue={searchValue}
            onSearchChange={(e) => setSearchValue(e.target.value)}
            onSearchClear={() => setSearchValue('')}
            searchPlaceholder="Search…"
            filters={filterConfig}
            orientation="stack"
            className="p-0"
          />
          <DateRangePicker
            valueType="date"
            className="w-full"
            placeholder="Issued: all dates"
            clearable
            value={dateRange ?? {}}
            onChange={(range) =>
              setDateRange(
                range.from ? { from: range.from, to: range.to } : undefined
              )
            }
          />
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            className="rounded-[2px] px-2 py-1 hover:bg-accent disabled:opacity-40"
            disabled={page <= 1}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: Math.max(0, prev.pageIndex - 1),
              }))
            }
          >
            Prev
          </button>
          <span>
            {page}/{pageCount || 1}
          </span>
          <button
            type="button"
            className="rounded-[2px] px-2 py-1 hover:bg-accent disabled:opacity-40"
            disabled={page >= (pageCount || 1)}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                pageIndex: prev.pageIndex + 1,
              }))
            }
          >
            Next
          </button>
        </div>
      }
    >
      {error ? (
        <div className="p-3">
          <ErrorState error={error} onRetry={() => refetch()} />
        </div>
      ) : isLoading ? (
        <div className="space-y-2 p-3" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-[2px] border border-black/[0.06] p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
          No invoices found
        </p>
      ) : (
        filteredData.map((invoice: Invoice) => (
          <DocumentListRow
            key={invoice.uuid}
            selected={invoice.uuid === selectedId}
            onClick={() => setSelectedId(invoice.uuid)}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {customerLabel(invoice)}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-foreground">
                {Number(invoice.invoiceTotal).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-muted-foreground">
                {invoice.invoiceNumber || invoice.invoiceId}
              </span>
              <span className={statusClass(invoice.status)}>{invoice.status}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {moment(invoice.issuedDate).format('MMM DD, YYYY')}
            </span>
          </DocumentListRow>
        ))
      )}
    </DocumentListPanel>
  );

  if (selectedId) {
    return (
      <DocumentMasterDetail
        className="min-h-0 flex-1"
        selectedId={selectedId}
        list={list}
        detail={
          <InvoiceDetailPanel invoiceId={selectedId} fallback={selectedFromList} />
        }
        preview={
          <InvoiceDetailPreview invoiceId={selectedId} fallback={selectedFromList} />
        }
        previewLabel="Invoice preview"
        previewDownloadTitle={
          selectedFromList?.invoiceNumber ||
          selectedFromList?.invoiceId ||
          'Invoice'
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 bg-main-bg p-4 md:p-5">
      <ListToolbar
        actions={
          <>
            {table && filteredData.length > 0 && <DataTableViewOptions table={table} />}
            <ExportButton
              filename="invoices"
              rows={filteredData}
              fetchAllRows={fetchAllInvoices}
              columns={INVOICE_EXPORT_COLUMNS}
            />
            <Link href="/account_receivables/invoice/new">
              <Button
                text="New invoice"
                icon={<i className="ri-add-line" />}
                theme="default"
                type="button"
              />
            </Link>
          </>
        }
      >
        <DynamicFilter
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          onSearchClear={() => setSearchValue('')}
          searchPlaceholder="Search invoices…"
          filters={filterConfig}
          className="p-0"
        />
        <DateRangePicker
          valueType="date"
          className="w-auto min-w-[240px]"
          placeholder="Issued: all dates"
          clearable
          value={dateRange ?? {}}
          onChange={(range) =>
            setDateRange(
              range.from ? { from: range.from, to: range.to } : undefined
            )
          }
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          onRowClick={(row) => setSelectedId(row.uuid)}
          isLoading={isLoading}
          storageKey="invoices-table"
          emptyMessage="No invoices yet"
          showViewOptions={false}
          onTableChange={onTableChange}
          {...tableProps(data?.meta, data?.data?.length)}
        />
      )}
    </div>
  );
};

export default InvoiceTable;
