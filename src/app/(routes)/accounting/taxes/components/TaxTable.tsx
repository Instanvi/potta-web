'use client';
import { useMemo, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { DataTable, useDataTableHandle } from '@potta/components/ui/data-table';
import { DataTableViewOptions } from '@potta/components/ui/data-table-view-options';
import Button from '@potta/components/button';
import Search from '@potta/components/search';
import Select from '@potta/components/select';
import { Can, useCan } from '@/components/auth/can';
import ConfirmModal from '../../../_shared/ConfirmModal';
import { formatAmount } from '../../../_shared/format';
import { ErrorState, ListToolbar, StatusBadge } from '../../../_shared/states';
import { ExportButton } from '@/components/export-button';
import { useDeleteTax, useImportTaxesCsv, useTaxes } from '../hooks';
import { Tax, taxApi } from '../utils/api';
import { fetchAllPages } from '@/lib/fetch-all-pages';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useServerPagination } from '@/hooks/use-server-pagination';
import TaxSheet from './TaxSheet';

const TaxTable = () => {
  const { canAccess } = useCan();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'PERCENTAGE' | 'FIXED'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  // Search is sent to the API (backend searchableColumns: name, description, taxId, type).
  // TODO: Type/Status filters are still client-side on the current page until the backend
  // exposes filterableColumns for them (parallel backend task).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const { page, limit, tableProps } = useServerPagination({
    pageSize: 10,
    resetOn: [debouncedSearch, typeFilter, statusFilter],
  });
  const { data, isLoading, error, refetch } = useTaxes({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const { table, onTableChange } = useDataTableHandle<Tax>();
  const deleteMutation = useDeleteTax();
  const importMutation = useImportTaxesCsv();
  const fileInput = useRef<HTMLInputElement>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [toDelete, setToDelete] = useState<Tax | null>(null);

  const rows = useMemo(() => {
    return (data?.data ?? []).filter((tax) => {
      if (typeFilter !== 'all' && tax.type !== typeFilter) return false;
      if (statusFilter === 'active' && !tax.isActive) return false;
      if (statusFilter === 'inactive' && tax.isActive) return false;
      return true;
    });
  }, [data?.data, typeFilter, statusFilter]);

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
      enableHiding: false,
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canAccess('Tax', 'update') && (
            <button
              type="button"
              title="Edit"
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
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
              className="rounded-full p-2 text-destructive hover:bg-destructive/10"
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
              filename="taxes"
              rows={rows}
              fetchAllRows={async () => {
                const all = await fetchAllPages<Tax>((p, l) =>
                  taxApi.list({ page: p, limit: l, search: debouncedSearch || undefined }),
                );
                return all.filter(
                  (tax) =>
                    (typeFilter === 'all' || tax.type === typeFilter) &&
                    (statusFilter === 'all' ||
                      (statusFilter === 'active' ? tax.isActive : !tax.isActive)),
                );
              }}
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
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          className="w-full max-w-sm"
        />
        <Select
          name="Filter by type"
          SelectClass="w-44 shrink-0"
          selectedValue={typeFilter}
          onChange={(v) => setTypeFilter(v as typeof typeFilter)}
          options={[
            { value: 'all', label: 'All types' },
            { value: 'PERCENTAGE', label: 'Percentage' },
            { value: 'FIXED', label: 'Fixed' },
          ]}
        />
        <Select
          name="Filter by status"
          SelectClass="w-44 shrink-0"
          selectedValue={statusFilter}
          onChange={(v) => setStatusFilter(v as typeof statusFilter)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </ListToolbar>

      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <DataTable
          emptyMessage="No taxes configured"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          {...tableProps(data?.meta, rows.length)}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          showViewOptions={false}
          onTableChange={onTableChange}
          storageKey="taxes-table"
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
