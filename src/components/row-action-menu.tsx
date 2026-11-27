'use client';

import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';

export type RowAction = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
};

/** Compact row menu so table actions don't sit as a row of buttons. */
export function RowActionMenu({
  label = 'Row actions',
  items,
}: {
  label?: string;
  items: RowAction[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className="rounded-full p-2 hover:bg-black/[0.04]"
          >
            <i className="ri-more-2-fill text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-white">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.label}
              disabled={item.disabled}
              className={
                item.destructive
                  ? 'cursor-pointer text-destructive focus:text-destructive'
                  : 'cursor-pointer'
              }
              onClick={item.onSelect}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
