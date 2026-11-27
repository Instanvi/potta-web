'use client';

import type { ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';
import Button from '@potta/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';

function columnLabel(column: {
  id: string;
  columnDef: { header?: unknown; meta?: unknown };
}): string {
  const meta = column.columnDef.meta as { label?: string } | undefined;
  if (meta?.label) return meta.label;
  const header = column.columnDef.header;
  if (typeof header === 'string') return header;
  return column.id
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/** One Actions menu for list toolbars: export and other commands, plus column visibility. */
export function ListActionsMenu<T>({
  table,
  children,
}: {
  table?: Table<T> | null;
  children?: ReactNode;
}) {
  const hideable = table?.getAllColumns().filter((column) => column.getCanHide()) ?? [];
  const hasColumns = hideable.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          text="Actions"
          theme="outline"
          icon={<i className="ri-more-2-line" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        {children}
        {children && hasColumns ? <DropdownMenuSeparator /> : null}
        {hasColumns ? (
          <>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Columns
            </DropdownMenuLabel>
            {hideable.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(event) => event.preventDefault()}
              >
                {columnLabel(column)}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ListActionItem({
  label,
  icon,
  onSelect,
  disabled,
  destructive,
}: {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <DropdownMenuItem
      disabled={disabled}
      className={
        destructive
          ? 'cursor-pointer text-destructive focus:text-destructive'
          : 'cursor-pointer'
      }
      onSelect={onSelect}
    >
      {icon}
      {label}
    </DropdownMenuItem>
  );
}
