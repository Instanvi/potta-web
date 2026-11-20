'use client';

import { useMemo, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { EmptyState, ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';
import {
  useDeletePaymentMethod,
  usePaymentMethods,
  useSeedPaymentMethods,
} from '../hooks';
import type { OrgPaymentMethod } from '../utils/api';
import PaymentMethodSheet from './PaymentMethodSheet';

const PaymentMethodTable = () => {
  const { canAccess } = useCan();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const { data, isLoading, error, refetch } = usePaymentMethods({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const deleteMutation = useDeletePaymentMethod();
  const seedMutation = useSeedPaymentMethods();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<OrgPaymentMethod | null>(null);
  const [toDelete, setToDelete] = useState<OrgPaymentMethod | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.data ?? []).filter((m) => {
      if (!q) return true;
      return (
        m.name?.toLowerCase().includes(q) ||
        m.code?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      );
    });
  }, [data?.data, search]);

  const columns: ColumnDef<OrgPaymentMethod>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: 'code', header: 'Code' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '—',
    },
    {
      accessorKey: 'isSystem',
      header: 'Type',
      cell: ({ row }) => (row.original.isSystem ? 'Default' : 'Custom'),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge tone={row.original.isActive ? 'success' : 'neutral'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {canAccess('PaymentMethod', 'update') && (
            <button
              type="button"
              title="Edit"
              className="rounded-[2px] p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => {
                setEditing(row.original);
                setSheetOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canAccess('PaymentMethod', 'remove') && !row.original.isSystem && (
            <button
              type="button"
              title="Delete"
              className="rounded-[2px] p-2 text-destructive hover:bg-destructive/10"
              onClick={() => setToDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Can resource="PaymentMethod" action="create">
              <Button
                text={seedMutation.isPending ? 'Seeding…' : 'Seed defaults'}
                type="button"
                theme="outline"
                isLoading={seedMutation.isPending}
                onClick={() => seedMutation.mutate()}
              />
              <Button
                text="Add method"
                type="button"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setEditing(null);
                  setSheetOpen(true);
                }}
              />
            </Can>
          </div>
        }
      >
        <Search
          placeholder="Search payment methods"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          onClear={() => {
            setSearch('');
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className="w-full max-w-sm"
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No payment methods"
          description="Seed the defaults or add your own (Wave, cheque, etc.)."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          manualPagination={!search}
          pageCount={search ? undefined : (data?.meta?.totalPages ?? 1)}
          totalRows={search ? rows.length : (data?.meta?.totalItems ?? 0)}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSize={pagination.pageSize}
          pageSizeOptions={[5, 10, 20, 50, 100]}
        />
      )}

      <PaymentMethodSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
      />

      <ConfirmModal
        open={!!toDelete}
        title="Delete payment method"
        message={`Remove “${toDelete?.name}”? Existing receipts keep their stored code.`}
        confirmText="Delete"
        danger
        isLoading={deleteMutation.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          deleteMutation.mutate(toDelete.uuid, { onSuccess: () => setToDelete(null) })
        }
      />
    </div>
  );
};

export default PaymentMethodTable;
