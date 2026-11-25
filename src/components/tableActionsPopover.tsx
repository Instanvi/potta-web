'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@potta/components/shadcn/dropdown';
import { cn } from '@potta/lib/utils';

export type PopoverAction = {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
};

const TableActionPopover: React.FC<{
  actions: PopoverAction[];
  triggerButton?: React.ReactNode;
  rowUuid: string;
  openPopover: string | null;
  setOpenPopover: (uuid: string | null) => void;
  onClick?: () => void;
}> = ({ actions, triggerButton, rowUuid, openPopover, setOpenPopover }) => {
  const open = openPopover === rowUuid;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => setOpenPopover(isOpen ? rowUuid : null)}
    >
      <DropdownMenuTrigger asChild>
        {triggerButton ? (
          <span className="inline-flex">{triggerButton}</span>
        ) : (
          <button
            type="button"
            aria-label="Row actions"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
          >
            <i className="ri-more-2-fill text-base" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            className={cn('gap-2 cursor-pointer', action.className)}
            onSelect={() => {
              setOpenPopover(null);
              action.onClick();
            }}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableActionPopover;
