'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import type { Table } from '@tanstack/react-table';
import type { ServerTableProps } from '@/hooks/use-server-pagination';
import { cellValue } from '@/lib/books-api';

export type BooksListColumn = { key: string; label: string };

type BooksListTableProps<T extends Record<string, unknown>> = {
  columns: BooksListColumn[];
  rows: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  showPagination?: boolean;
  storageKey?: string;
  showViewOptions?: boolean;
  /** Row checkboxes. Default true. */
  withRowSelection?: boolean;
  /** Spread `useServerPagination().tableProps(meta, rows.length)` for API-driven pages. */
  serverPagination?: ServerTableProps;
  /** Lift the table instance so Columns can render inside a parent ListToolbar. */
  onTableChange?: (table: Table<T>) => void;
};

/** Shared DataTable chrome for books / payroll list pages. */
export function BooksListTable<T extends Record<string, unknown>>({
  columns,
  rows,
  isLoading,
  emptyMessage,
  onRowClick,
  showPagination,
  storageKey,
  showViewOptions,
  withRowSelection = true,
  serverPagination,
  onTableChange,
}: BooksListTableProps<T>) {
  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.key,
        header: c.label,
        accessorFn: (row) => cellValue(row, c.key),
        cell: ({ row }) => cellValue(row.original, c.key),
      })),
    [columns],
  );

  return (
    <DataTable
      data={rows}
      columns={defs}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      withRowSelection={withRowSelection}
      onRowClick={onRowClick}
      showPagination={showPagination ?? (serverPagination ? true : rows.length > 10)}
      pageSize={10}
      {...serverPagination}
      storageKey={storageKey}
      showViewOptions={showViewOptions}
      onTableChange={onTableChange}
    />
  );
}
