'use client';

import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@potta/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 font-normal hover:text-foreground',
        className,
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      {sorted === 'asc' && <ArrowUp className="size-3.5 text-muted-foreground" />}
      {sorted === 'desc' && (
        <ArrowDown className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}
