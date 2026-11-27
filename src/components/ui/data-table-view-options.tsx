'use client';

import type { Table } from '@tanstack/react-table';
import { ListActionsMenu } from '@/components/list-actions-menu';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

/** Column visibility uses the same borderless More menu as every other list. */
export function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const hideable = table.getAllColumns().filter((column) => column.getCanHide());
  if (hideable.length === 0) return null;
  return <ListActionsMenu table={table} />;
}
