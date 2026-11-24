'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { cellValue } from '@/lib/books-api';

export type BooksListColumn = { key: string; label: string };

type BooksListTableProps<T extends Record<string, unknown>> = {
  columns: BooksListColumn[];
  rows: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  showPagination?: boolean;
  storageKey?: string;
  showViewOptions?: boolean;
};

/** Shared DataTable chrome for books / payroll list pages. */
export function BooksListTable<T extends Record<string, unknown>>({
  columns,
  rows,
  isLoading,
  onRowClick,
  showPagination,
  storageKey,
  showViewOptions,
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
      withRowSelection={false}
      onRowClick={onRowClick}
      showPagination={showPagination ?? rows.length > 10}
      pageSize={10}
      storageKey={storageKey}
      showViewOptions={showViewOptions}
    />
  );
}
