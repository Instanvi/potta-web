'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import moment from 'moment';
import { toast } from 'sonner';
import { ColumnDef, SortingState, Updater } from '@tanstack/react-table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { ErrorState, ListToolbar } from '../../../_shared/states';
import { Skeleton } from '@potta/components/ui/loaders';
import { IFilter } from '../_utils/types';
import useGetAllInvoice from '../_hooks/useGetAllInvoice';
import useDeleteInvoice from '../_hooks/useDeleteInvoice';
import useSendInvoice from '../_hooks/useSendInvoice';
import { useInvoiceFilter } from '../_context/InvoiceFilterContext';
import {
  InvoiceDetailPanel,
  InvoiceDetailPreview,
} from './InvoiceDetailPanel';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { ListActionsMenu } from '@/components/list-actions-menu';
import { ExportButton } from '@/components/export-button';
import type { ExportColumn } from '@/lib/export-file';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import { invoiceApi } from '../_utils/api';
import type { DocumentChannel } from '@/components/document-channel-menu';

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
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const { dateRange, setDateRange, statusFilter, setStatusFilter } =
    useInvoiceFilter();
  const debouncedSearch = useDebouncedValue(searchValue.trim(), 300);
  const issuedFrom = dateRange?.from
    ? startOfLocalDay(dateRange.from).toISOString()
    : undefined;
  const issuedTo = dateRange?.from
    ? endOfLocalDay(dateRange.to ?? dateRange.from).toISOString()
    : undefined;
  const sortColumnId = sorting[0]?.id || 'createdAt';
  const sortOrder: IFilter['sortOrder'] = sorting[0]?.desc === false ? 'ASC' : 'DESC';
  const apiSortFields = new Set<NonNullable<IFilter['sortBy']>>([
    'createdAt',
    'updatedAt',
    'issuedDate',
    'dueDate',
    'invoiceTotal',
  ]);
  const apiSortBy: NonNullable<IFilter['sortBy']> = apiSortFields.has(
    sortColumnId as NonNullable<IFilter['sortBy']>,
  )
    ? (sortColumnId as NonNullable<IFilter['sortBy']>)
    : 'createdAt';
  const { page, limit, setPagination, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [statusFilter, debouncedSearch, issuedFrom, issuedTo, apiSortBy, sortOrder],
  });

  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const first = next[0];
      if (!first) return [{ id: 'createdAt', desc: true }];
      return [first];
    });
  }, []);

  const filter: IFilter = {
    limit,
    page,
    sortOrder,
    sortBy: apiSortBy,
    status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
    search: debouncedSearch || undefined,
    issuedFrom,
    issuedTo,
  };

  const { data, isLoading, error, refetch } = useGetAllInvoice(filter);
  const { table, onTableChange } = useDataTableHandle<Invoice>();
  const deleteMutation = useDeleteInvoice();
  const sendMutation = useSendInvoice();
  const [toDelete, setToDelete] = useState<Invoice | null>(null);
  const [sendTarget, setSendTarget] = useState<{
    invoice: Invoice;
    channel: DocumentChannel;
  } | null>(null);

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
        enableSorting: false,
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
      {
        id: 'actions',
        enableHiding: false,
        enableSorting: false,
        header: '',
        cell: ({ row: { original } }) => {
          const customerEmail = (original.customer?.email || '').trim();
          const customerPhone = (original.customer?.phone || '').trim();
          const hasCustomer = Boolean(original.customer);
          const sending = sendMutation.isPending;

          return (
            <div
              className="flex justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-2 hover:bg-black/[0.04]"
                    aria-label="Invoice actions"
                  >
                    <i className="ri-more-2-fill text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setSelectedId(original.uuid)}
                  >
                    <i className="ri-eye-line mr-2" />
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
                        className="cursor-pointer"
                        onClick={() => {
                          if (!customerEmail) return;
                          setSendTarget({
                            invoice: original,
                            channel: 'email',
                          });
                        }}
                      >
                        <i className="ri-mail-line mr-2" />
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
                        className="cursor-pointer"
                        onClick={() => {
                          if (!customerPhone) return;
                          setSendTarget({
                            invoice: original,
                            channel: 'sms',
                          });
                        }}
                      >
                        <i className="ri-message-2-line mr-2" />
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
                    className="cursor-pointer text-destructive"
                    onClick={() => setToDelete(original)}
                  >
                    <i className="ri-delete-bin-line mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [sendMutation.isPending, setSelectedId]
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
    <div className="flex min-h-0 flex-1 flex-col gap-4 bg-white p-4 md:p-5">
      <ListToolbar
        actions={
          <>
                        <ListActionsMenu table={table}>
            <ExportButton
              asItem
              filename="invoices"
              rows={filteredData}
              fetchAllRows={fetchAllInvoices}
              columns={INVOICE_EXPORT_COLUMNS}
            />
            </ListActionsMenu>
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
          manualSorting
          sorting={sorting}
          onSortingChange={handleSortingChange}
          {...tableProps(data?.meta, data?.data?.length)}
        />
      )}

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Delete invoice?"
        message={`Delete ${
          toDelete?.invoiceNumber || toDelete?.invoiceId || 'this invoice'
        }? This cannot be undone.`}
        confirmText="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) setToDelete(null);
        }}
        onConfirm={() => {
          if (!toDelete) return;
          deleteMutation.mutate(toDelete.uuid, {
            onSuccess: () => {
              toast.success('Invoice deleted');
              setToDelete(null);
            },
            onError: (err: unknown) => {
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
              toast.error(message || 'Failed to delete invoice');
            },
          });
        }}
      />
      <ConfirmModal
        open={Boolean(sendTarget)}
        title={
          sendTarget?.channel === 'sms'
            ? 'Send invoice by SMS?'
            : 'Send invoice by email?'
        }
        message={
          sendTarget?.channel === 'sms'
            ? `Text a download link for ${
                sendTarget.invoice.invoiceNumber ||
                sendTarget.invoice.invoiceId
              } to ${sendTarget.invoice.customer?.phone?.trim() || 'the customer'}?`
            : `Email a download link for ${
                sendTarget?.invoice.invoiceNumber ||
                sendTarget?.invoice.invoiceId ||
                ''
              } to ${
                sendTarget?.invoice.customer?.email?.trim() || 'the customer'
              }?`
        }
        confirmText="Send"
        isLoading={sendMutation.isPending}
        onClose={() => {
          if (!sendMutation.isPending) setSendTarget(null);
        }}
        onConfirm={() => {
          if (!sendTarget) return;
          const { invoice, channel } = sendTarget;
          const email = (invoice.customer?.email || '').trim();
          const phone = (invoice.customer?.phone || '').trim();
          sendMutation.mutate(
            {
              invoiceId: invoice.uuid,
              data: {
                channel,
                to: channel === 'email' ? email : undefined,
                phone: channel === 'sms' ? phone : undefined,
              },
            },
            {
              onSuccess: (res) => {
                toast.success(
                  res?.channel === 'sms' || channel === 'sms'
                    ? `Invoice texted to ${res?.to || phone}`
                    : `Invoice emailed to ${res?.to || email}`,
                );
                setSendTarget(null);
              },
              onError: (err: unknown) => {
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
                toast.error(message || 'Failed to send invoice download link');
              },
            },
          );
        }}
      />
    </div>
  );
};

export default InvoiceTable;
