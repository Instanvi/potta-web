'use client';
import { useMemo, useRef, useState } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { DataTable } from '@potta/components/ui/data-table';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount } from '../../../_shared/format';
import { EmptyState, ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { useDeleteTax, useImportTaxesCsv, useTaxes } from '../hooks';
import { Tax } from '../utils/api';
import TaxSheet from './TaxSheet';

const TaxTable = () => {
  const { canAccess } = useCan();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PERCENTAGE' | 'FIXED'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.data ?? []).filter((tax) => {
      if (typeFilter !== 'all' && tax.type !== typeFilter) return false;
      if (statusFilter === 'active' && !tax.isActive) return false;
      if (statusFilter === 'inactive' && tax.isActive) return false;
      if (!q) return true;
      return (
        tax.name?.toLowerCase().includes(q) ||
        tax.taxId?.toLowerCase().includes(q) ||
        tax.description?.toLowerCase().includes(q)
      );
    });
  }, [data?.data, search, typeFilter, statusFilter]);

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

  const filterSelectClass =
    'h-10 rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-white px-3 text-sm text-foreground outline-none focus-visible:border-primary';

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <ExportButton
              filename="taxes"
              rows={rows}
              columns={[
                { key: 'name', header: 'Name' },
                {
                  key: 'taxId',
                  header: 'Code',
                  value: (row) => row.taxId || '',
                },
                {
                  key: 'type',
                  header: 'Type',
                  value: (row) =>
                    row.type === 'FIXED' ? 'Fixed' : 'Percentage',
                },
                {
                  key: 'value',
                  header: 'Rate / amount',
                  value: (row) =>
                    row.type === 'FIXED'
                      ? formatAmount(row.flatRate)
                      : `${Number(row.rate ?? 0)}%`,
                },
                {
                  key: 'isActive',
                  header: 'Status',
                  value: (row) => (row.isActive ? 'Active' : 'Inactive'),
                },
                {
                  key: 'description',
                  header: 'Description',
                  value: (row) => row.description || '',
                },
              ]}
            />
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
        }
      >
        <Search
          placeholder="Search taxes"
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
        <select
          className={filterSelectClass}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as typeof typeFilter);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed</option>
        </select>
        <select
          className={filterSelectClass}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as typeof statusFilter);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </ListToolbar>

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
          manualPagination={!search && typeFilter === 'all' && statusFilter === 'all'}
          pageCount={
            search || typeFilter !== 'all' || statusFilter !== 'all'
              ? undefined
              : (data?.meta?.totalPages ?? 1)
          }
          totalRows={
            search || typeFilter !== 'all' || statusFilter !== 'all'
              ? rows.length
              : (data?.meta?.totalItems ?? 0)
          }
          pagination={pagination}
          onPaginationChange={setPagination}
          pageSize={pagination.pageSize}
          pageSizeOptions={[5, 10, 20, 50, 100]}
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
