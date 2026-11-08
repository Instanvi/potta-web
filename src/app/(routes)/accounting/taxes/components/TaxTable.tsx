'use client';
import { useRef, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount } from '../../../_shared/format';
import { EmptyState, ErrorState } from '../../../_shared/states';
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
        <span
          className={`px-2 py-0.5 text-xs font-medium border ${
            row.original.isActive
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 bg-gray-50 text-gray-600'
          }`}
        >
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
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
              className="p-2 hover:bg-gray-100"
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
              className="p-2 text-red-600 hover:bg-red-50"
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
    <div>
      <div className="flex justify-end gap-2 mb-4">
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
            icon={<i className="ri-upload-2-line" />}
            isLoading={importMutation.isPending}
            onClick={() => fileInput.current?.click()}
          />
          <Button
            text="New tax"
            type="button"
            icon={<i className="ri-add-line" />}
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
