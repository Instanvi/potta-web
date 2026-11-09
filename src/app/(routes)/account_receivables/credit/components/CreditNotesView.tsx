'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import Select from '@potta/components/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount, formatDate } from '../../../_shared/format';
import {
  EmptyState,
  ErrorState,
  ListToolbar,
  PageHeader,
} from '../../../_shared/states';
import {
  useApproveCreditNote,
  useCreditNotes,
  useDeleteCreditNote,
} from '../_hooks';
import { CreditNote, CreditNoteStatus, partyName } from '../_utils/types';
import ApplyInvoiceModal from './ApplyInvoiceModal';
import CreditNoteDetailsSheet from './CreditNoteDetailsSheet';
import CreditNoteStatusBadge from './CreditNoteStatusBadge';
import RefundModal from './RefundModal';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'REJECTED', label: 'Rejected' },
];

const CreditNotesView = () => {
  const { canAccess } = useCan();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [status, setStatus] = useState<string>('all');
  const filter = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    status: status === 'all' ? undefined : (status as CreditNoteStatus),
  };
  const { data, isLoading, error, refetch } = useCreditNotes(filter);

  const [viewId, setViewId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CreditNote | null>(null);
  const [toApprove, setToApprove] = useState<CreditNote | null>(null);
  const [toRefund, setToRefund] = useState<CreditNote | null>(null);
  const [toApply, setToApply] = useState<CreditNote | null>(null);
  const deleteMutation = useDeleteCreditNote();
  const approveMutation = useApproveCreditNote();

  const columns = useMemo<ColumnDef<CreditNote>[]>(
    () => [
      {
        accessorKey: 'creditNoteId',
        header: 'Credit note',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.creditNoteId}</span>
        ),
      },
      {
        accessorKey: 'issueDate',
        header: 'Issue date',
        cell: ({ row }) => formatDate(row.original.issueDate),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => partyName(row.original.customer),
      },
      {
        id: 'invoice',
        header: 'Invoice',
        cell: ({ row }) => {
          const inv = row.original.invoice;
          return inv ? inv.invoiceNumber || inv.invoiceId || inv.code : '—';
        },
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[220px]">{row.original.reason}</span>
        ),
      },
      {
        accessorKey: 'creditAmount',
        header: 'Amount',
        cell: ({ row }) =>
          formatAmount(row.original.creditAmount, row.original.invoice?.currency),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <CreditNoteStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const note = row.original;
          const canApprove = note.status === 'DRAFT' || note.status === 'PENDING';
          const canRefund = note.status === 'APPROVED' && !note.refundedAt;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100">
                    <i className="ri-more-2-fill text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setViewId(note.uuid)}>
                    <i className="ri-eye-line mr-2" /> View details
                  </DropdownMenuItem>
                  {canApprove && canAccess('CreditNote', ['approve', 'update']) && (
                    <DropdownMenuItem onClick={() => setToApprove(note)}>
                      <i className="ri-check-line mr-2" /> Approve
                    </DropdownMenuItem>
                  )}
                  {canRefund && canAccess('CreditNote', ['refund', 'update']) && (
                    <DropdownMenuItem onClick={() => setToRefund(note)}>
                      <i className="ri-refund-2-line mr-2" /> Refund
                    </DropdownMenuItem>
                  )}
                  {note.status !== 'REFUNDED' &&
                    canAccess('CreditNote', 'add-invoice') && (
                      <DropdownMenuItem onClick={() => setToApply(note)}>
                        <i className="ri-links-line mr-2" /> Apply to invoice
                      </DropdownMenuItem>
                    )}
                  {canAccess('CreditNote', 'remove') && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setToDelete(note)}
                    >
                      <i className="ri-delete-bin-line mr-2" /> Delete
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

  const rows = data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Credit notes"
        description="Credits issued to customers against invoices."
      />
      <ListToolbar
        actions={
          <Can resource="CreditNote" action="create">
            <Link href="/account_receivables/credit/new">
              <Button
                text="New credit note"
                type="button"
                theme="default"
                icon={<i className="ri-file-add-line" />}
              />
            </Link>
          </Can>
        }
      >
        <div className="w-56">
          <Select
            options={STATUS_OPTIONS}
            selectedValue={status}
            onChange={(v: string) => {
              setStatus(v);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            bg="bg-white"
          />
        </div>
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No credit notes yet"
          description="Create a credit note to refund or credit a customer invoice."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          onRowClick={(row) => setViewId(row.uuid)}
          manualPagination
          pageCount={data?.meta?.totalPages ?? 1}
          totalRows={data?.meta?.totalItems ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSize={pagination.pageSize}
        />
      )}

      <CreditNoteDetailsSheet creditNoteId={viewId} onClose={() => setViewId(null)} />
      <RefundModal creditNote={toRefund} onClose={() => setToRefund(null)} />
      <ApplyInvoiceModal creditNote={toApply} onClose={() => setToApply(null)} />
      <ConfirmModal
        open={!!toApprove}
        title="Approve credit note"
        message={`Approving ${toApprove?.creditNoteId} posts the accounting entries. Continue?`}
        confirmText="Approve"
        isLoading={approveMutation.isPending}
        onClose={() => setToApprove(null)}
        onConfirm={() =>
          toApprove &&
          approveMutation.mutate(toApprove.uuid, {
            onSuccess: () => setToApprove(null),
          })
        }
      />
      <ConfirmModal
        open={!!toDelete}
        title="Delete credit note"
        message={`Delete ${toDelete?.creditNoteId}? This cannot be undone.`}
        confirmText="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          deleteMutation.mutate(toDelete.uuid, {
            onSuccess: () => setToDelete(null),
          })
        }
      />
    </>
  );
};

export default CreditNotesView;
