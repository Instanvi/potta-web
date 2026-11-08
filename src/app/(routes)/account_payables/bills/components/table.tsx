'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatDate } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
import { formatMoney } from '../../utils/format';
import { useApproveBill, useBills } from '../hooks';
import { Bill, BillStatus } from '../utils/types';
import BillDetailsSlideover from './BillDetailsSlideover';
import BillStatusBadge from './BillStatusBadge';
import Filter from './filters';
import PayBillModal from './PayBillModal';
import RejectBillModal from './RejectBillModal';

const isPastDue = (bill: Bill) =>
  (bill.status === 'APPROVED' || bill.status === 'ISSUED' || bill.status === 'OVERDUE') &&
  !!bill.dueDate &&
  new Date(bill.dueDate) < new Date();

interface BillsTableProps {
  initialBillId?: string | null;
}

export function BillsTable({ initialBillId }: BillsTableProps) {
  const { canAccess } = useCan();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [vendorId, setVendorId] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

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

  const [selectedBillId, setSelectedBillId] = useState<string | null>(initialBillId ?? null);
  const [toApprove, setToApprove] = useState<Bill | null>(null);
  const [toReject, setToReject] = useState<Bill | null>(null);
  const [toPay, setToPay] = useState<Bill | null>(null);
  const approve = useApproveBill();

  useEffect(() => {
    if (initialBillId) setSelectedBillId(initialBillId);
  }, [initialBillId]);

  const columns = useMemo<ColumnDef<Bill>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Bill',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">{row.original.code}</p>
            {row.original.vendorInvoiceNumber && (
              <p className="text-xs text-gray-500">Vendor ref. {row.original.vendorInvoiceNumber}</p>
            )}
          </div>
        ),
      },
      {
        id: 'vendor',
        header: 'Vendor',
        cell: ({ row }) => row.original.vendor?.name ?? '—',
      },
      {
        accessorKey: 'issuedDate',
        header: 'Issued',
        cell: ({ row }) => formatDate(row.original.issuedDate),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due date',
        cell: ({ row }) => (
          <span className={isPastDue(row.original) ? 'font-medium text-red-600' : ''}>
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        accessorKey: 'invoiceTotal',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-medium text-gray-900">
            {formatMoney(row.original.invoiceTotal, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <BillStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const bill = row.original;
          const open = bill.status === 'DRAFT' || bill.status === 'ISSUED';
          const payable = bill.status === 'APPROVED' || bill.status === 'OVERDUE';
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSelectedBillId(bill.uuid)}>
                    <i className="ri-eye-line mr-2" /> View details
                  </DropdownMenuItem>
                  {open && canAccess('Bill', 'approve') && (
                    <DropdownMenuItem onClick={() => setToApprove(bill)}>
                      <i className="ri-check-line mr-2" /> Approve
                    </DropdownMenuItem>
                  )}
                  {open && canAccess('Bill', 'reject') && (
                    <DropdownMenuItem className="text-red-600" onClick={() => setToReject(bill)}>
                      <i className="ri-close-line mr-2" /> Reject
                    </DropdownMenuItem>
                  )}
                  {payable && canAccess('Bill', 'pay') && (
                    <DropdownMenuItem onClick={() => setToPay(bill)}>
                      <i className="ri-bank-card-line mr-2" /> Record payment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [canAccess]
  );

  return (
    <div>
      <Filter
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(v) => setStatus(v || 'all')}
        vendorId={vendorId}
        onVendorChange={setVendorId}
      />

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title={filtered ? 'No bills match these filters' : 'No bills yet'}
          description={
            filtered
              ? 'Clear the search or filters to see all bills.'
              : 'Record a vendor bill to track what you owe; approving it posts the expense and payable.'
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          onRowClick={(row) => setSelectedBillId(row.uuid)}
          manualPagination
          pageCount={data?.meta?.totalPages ?? 1}
          totalRows={data?.meta?.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSize={pagination.pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}

      <BillDetailsSlideover billId={selectedBillId} onClose={() => setSelectedBillId(null)} />
      <RejectBillModal bill={toReject} onClose={() => setToReject(null)} />
      <PayBillModal bill={toPay} onClose={() => setToPay(null)} />
      <ConfirmModal
        open={!!toApprove}
        title={`Approve bill ${toApprove?.code ?? ''}`}
        message={
          toApprove
            ? `Approving posts ${formatMoney(toApprove.invoiceTotal, toApprove.currency)} to the books (expense + VAT / vendor payable). Continue?`
            : ''
        }
        confirmText="Approve"
        isLoading={approve.isPending}
        onClose={() => setToApprove(null)}
        onConfirm={() =>
          toApprove && approve.mutate({ id: toApprove.uuid }, { onSuccess: () => setToApprove(null) })
        }
      />
    </div>
  );
}

export default BillsTable;
