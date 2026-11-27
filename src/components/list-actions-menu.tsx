'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { Table } from '@tanstack/react-table';
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

/** One More menu for list toolbars: export and other commands, plus column visibility. */
export function ListActionsMenu<T>({
  table,
  children,
}: {
  table?: Table<T> | null;
  children?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const hideable = table?.getAllColumns().filter((column) => column.getCanHide()) ?? [];
  const hasColumns = hideable.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const trigger = (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1 rounded-[2px] border-0 bg-transparent px-2 text-sm font-normal text-foreground shadow-none hover:bg-accent"
    >
      More
      <i className="ri-arrow-down-s-line text-base" aria-hidden />
    </button>
  );

  // Radix ids differ between the server and the browser. Rendering the menu
  // before mount leaves the trigger attributes unpatched, so the click never opens it.
  if (!mounted) return trigger;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[200] w-56 bg-white">
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
