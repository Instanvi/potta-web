'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import Button from '@potta/components/button';
import DynamicFilter from '@potta/components/dynamic-filter';
import { Can, useCan } from '@/components/auth/can';
import { ExportButton } from '@/components/export-button';
import {
  DocumentMasterDetail,
  DocumentListPanel,
  DocumentListRow,
} from '@potta/components/document-master-detail';
import DataGrid from '@potta/app/(routes)/account_receivables/invoice/components/DataGrid';
import { Skeleton } from '@potta/components/ui/loaders';
import { formatDate } from '../../../_shared/format';
import { EmptyState, ErrorState, ListToolbar } from '../../../_shared/states';
import { formatMoney } from '../../utils/format';
import { useVendorOptions } from '../../hooks';
import { useBills } from '../hooks';
import { Bill, BillStatus } from '../utils/types';
import { BillDetailPanel, BillPreviewPanel } from './BillDetailPanel';
import BillStatusBadge from './BillStatusBadge';

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Issued', value: 'ISSUED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Rejected', value: 'REJECTED' },
];

export function BillsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');

  const { canAccess } = useCan();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [vendorId, setVendorId] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch, status, vendorId]);

  const { data, isLoading, error, refetch } = useBills({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
    status: status === 'all' ? undefined : (status as BillStatus),
    vendorId: vendorId || undefined,
  });
  const rows = data?.data ?? [];
  const filtered = !!debouncedSearch || status !== 'all' || !!vendorId;
  const page = pagination.pageIndex + 1;
  const pageCount = data?.meta?.totalPages ?? 1;

  const { data: vendors = [] } = useVendorOptions();

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

  const filterControls = (orientation: 'row' | 'stack' = 'row') => (
    <DynamicFilter
      className="p-0"
      orientation={orientation}
      searchValue={search}
      onSearchChange={(e) => setSearch(e.target.value)}
      onSearchClear={() => setSearch('')}
      searchPlaceholder="Search bills…"
      filters={[
        {
          key: 'status',
          label: 'Status',
          value: status,
          options: statusOptions,
          onChange: (v) => setStatus(v || 'all'),
        },
        {
          key: 'vendor',
          label: 'All vendors',
          value: vendorId,
          isSearchable: true,
          selectClassName: 'min-w-[160px]',
          options: vendors.map((v) => ({ label: v.name, value: v.uuid })),
          onChange: setVendorId,
        },
      ]}
    />
  );

  const exportButton = (
    <ExportButton
      filename="bills"
      rows={rows}
      columns={[
        { key: 'code', header: 'Bill' },
        {
          key: 'vendorInvoiceNumber',
          header: 'Vendor ref',
          value: (row) => row.vendorInvoiceNumber || '',
        },
        {
          key: 'vendor',
          header: 'Vendor',
          value: (row) => row.vendor?.name ?? '',
        },
        {
          key: 'issuedDate',
          header: 'Issued',
          value: (row) => formatDate(row.issuedDate),
        },
        {
          key: 'dueDate',
          header: 'Due date',
          value: (row) => formatDate(row.dueDate),
        },
        {
          key: 'invoiceTotal',
          header: 'Amount',
          value: (row) => formatMoney(row.invoiceTotal, row.currency),
        },
        { key: 'status', header: 'Status' },
      ]}
    />
  );

  const columns: ColumnDef<Bill>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Bill',
        cell: ({ row: { original } }) => (
          <span className="font-medium text-foreground">{original.code}</span>
        ),
      },
      {
        accessorKey: 'vendorInvoiceNumber',
        header: 'Vendor ref',
        cell: ({ row: { original } }) => (
          <span>{original.vendorInvoiceNumber || '—'}</span>
        ),
      },
      {
        id: 'vendor',
        header: 'Vendor',
        cell: ({ row: { original } }) => (
          <span className="truncate">{original.vendor?.name ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'issuedDate',
        header: 'Issued',
        cell: ({ row: { original } }) => (
          <span>{formatDate(original.issuedDate)}</span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due',
        cell: ({ row: { original } }) => (
          <span>{formatDate(original.dueDate)}</span>
        ),
      },
      {
        accessorKey: 'invoiceTotal',
        header: 'Amount',
        cell: ({ row: { original } }) => (
          <span className="tabular-nums">
            {formatMoney(original.invoiceTotal, original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row: { original } }) => (
          <BillStatusBadge status={original.status} />
        ),
      },
    ],
    []
  );

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
              All bills
            </button>
            <Can resource="Bill" action="create">
              <Link
                href="/account_payables/bills/new"
                className="inline-flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="New bill"
                title="New bill"
              >
                <i className="ri-add-line text-lg" />
              </Link>
            </Can>
          </div>
          {filterControls('stack')}
          <div className="flex justify-end">{exportButton}</div>
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            className="rounded-[2px] px-2 py-1 hover:bg-accent disabled:opacity-40"
            disabled={page <= 1}
            onClick={() =>
              setPagination((p) => ({
                ...p,
                pageIndex: Math.max(0, p.pageIndex - 1),
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
            disabled={page >= pageCount}
            onClick={() =>
              setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
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
      ) : rows.length === 0 ? (
        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
          {filtered ? 'No bills match these filters' : 'No bills yet'}
        </p>
      ) : (
        rows.map((bill: Bill) => (
          <DocumentListRow
            key={bill.uuid}
            selected={bill.uuid === selectedId}
            onClick={() => setSelectedId(bill.uuid)}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {bill.code}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-foreground">
                {formatMoney(bill.invoiceTotal, bill.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-muted-foreground">
                {bill.vendor?.name ?? '—'}
              </span>
              <BillStatusBadge status={bill.status} />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Due {formatDate(bill.dueDate)}
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
        detail={<BillDetailPanel billId={selectedId} />}
        preview={<BillPreviewPanel billId={selectedId} />}
        previewLabel="Bill preview"
        previewDownloadTitle={
          rows.find((b) => b.uuid === selectedId)?.code || 'Bill'
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <ListToolbar
        actions={
          <>
            {exportButton}
            <Can resource="Bill" action="create">
              <Link href="/account_payables/bills/new">
                <Button
                  text="New bill"
                  icon={<i className="ri-add-line" />}
                  theme="default"
                  type="button"
                />
              </Link>
            </Can>
          </>
        }
      >
        {filterControls('row')}
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title={filtered ? 'No bills match these filters' : 'No bills yet'}
          description={
            filtered
              ? 'Try clearing filters, or create a new bill.'
              : 'Record a vendor bill to track what you owe.'
          }
          action={
            canAccess('Bill', 'create') ? (
              <Link href="/account_payables/bills/new">
                <Button text="New bill" type="button" theme="default" />
              </Link>
            ) : undefined
          }
        />
      ) : (
        <DataGrid
          columns={columns}
          data={rows}
          onRowClick={(row) => setSelectedId(row.uuid)}
          isLoading={isLoading}
          manualPagination
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          totalRows={data?.meta?.total}
        />
      )}
    </div>
  );
}

export default BillsTable;
