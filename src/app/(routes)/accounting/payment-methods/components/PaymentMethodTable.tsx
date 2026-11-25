'use client';

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';
import {
  useDeletePaymentMethod,
  usePaymentMethods,
  useSeedPaymentMethods,
} from '../hooks';
import type { OrgPaymentMethod } from '../utils/api';
import PaymentMethodSheet from './PaymentMethodSheet';
import { ExportButton } from '@/components/export-button';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useServerPagination } from '@/hooks/use-server-pagination';
import { paymentMethodApi } from '../utils/api';

const PaymentMethodTable = () => {
  const { canAccess } = useCan();
  const [search, setSearch] = useState('');
  // Search is sent to the API (backend searchableColumns: name, code, description).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 20,
    resetOn: [debouncedSearch],
  });
  const { data, isLoading, error, refetch } = usePaymentMethods({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const { table, onTableChange } = useDataTableHandle<OrgPaymentMethod>();
  const deleteMutation = useDeletePaymentMethod();
  const seedMutation = useSeedPaymentMethods();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<OrgPaymentMethod | null>(null);
  const [toDelete, setToDelete] = useState<OrgPaymentMethod | null>(null);

  const rows = useMemo(() => data?.data ?? [], [data?.data]);

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
      enableHiding: false,
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
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
            {table ? <DataTableViewOptions table={table} /> : null}
            <ExportButton
              filename="payment-methods"
              rows={rows}
              fetchAllRows={() =>
                fetchAllPages<OrgPaymentMethod>((p, l) =>
                  paymentMethodApi.list({
                    page: p,
                    limit: l,
                    search: debouncedSearch || undefined,
                  }),
                )
              }
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'code', header: 'Code' },
                { key: 'description', header: 'Description', value: (r) => r.description || '' },
                { key: 'isSystem', header: 'Type', value: (r) => (r.isSystem ? 'Default' : 'Custom') },
                { key: 'isActive', header: 'Status', value: (r) => (r.isActive ? 'Active' : 'Inactive') },
              ]}
            />
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
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="w-full max-w-sm"
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          emptyMessage="No payment methods"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          {...tableProps(data?.meta, rows.length)}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          showViewOptions={false}
          onTableChange={onTableChange}
          storageKey="payment-methods-table"
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
