'use client';
import { useRef, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount } from '../../../_shared/format';
import { EmptyState, ErrorState, StatusBadge } from '../../../_shared/states';
import { useDeleteTax, useImportTaxesCsv, useTaxes } from '../hooks';
import { Tax } from '../utils/api';
import TaxSheet from './TaxSheet';

const TaxTable = () => {
  const { canAccess } = useCan();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading, error, refetch } = useTaxes({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const deleteMutation = useDeleteTax();
  const importMutation = useImportTaxesCsv();
  const fileInput = useRef<HTMLInputElement>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [toDelete, setToDelete] = useState<Tax | null>(null);

  const rows = data?.data ?? [];

  const columns: ColumnDef<Tax>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: 'taxId', header: 'Code', cell: ({ row }) => row.original.taxId || '—' },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (row.original.type === 'FIXED' ? 'Fixed' : 'Percentage'),
    },
    {
      id: 'value',
      header: 'Rate / amount',
      cell: ({ row }) =>
        row.original.type === 'FIXED'
          ? formatAmount(row.original.flatRate)
          : `${Number(row.original.rate ?? 0)}%`,
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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description || '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {canAccess('Tax', 'update') && (
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
          {canAccess('Tax', 'remove') && (
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
      <div className="flex justify-end gap-3">
        <Can resource="Tax" action="create">
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importMutation.mutate(file);
              e.target.value = '';
            }}
          />
          <Button
            text="Import CSV"
            type="button"
            theme="outline"
            icon={<Upload className="h-4 w-4" />}
            isLoading={importMutation.isPending}
            onClick={() => fileInput.current?.click()}
          />
          <Button
            text="New tax"
            type="button"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          />
        </Can>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No taxes configured"
          description="Add the taxes you charge (e.g. VAT 19.25%) so they can be applied to items and invoices."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          withRowSelection={false}
          manualPagination
          pageCount={data?.meta?.totalPages ?? 1}
          totalRows={data?.meta?.totalItems ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSize={pagination.pageSize}
        />
      )}

      <TaxSheet
        open={sheetOpen}
        tax={editing}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
        }}
      />
      <ConfirmModal
        open={!!toDelete}
        title="Delete tax"
        message={`Delete ${toDelete?.name}? Items using it will no longer be taxed with it.`}
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

export default TaxTable;
