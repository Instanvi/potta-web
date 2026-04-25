'use client';
import React, { FC, useState } from 'react';
import {
  PopoverTrigger,
  PopoverContent,
  Popover as NextUIPopover,
  Button,
} from '@nextui-org/react';

// Define the types for the popover actions
export type PopoverAction = {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
};

// Popover Component
const TableActionPopover: React.FC<{
  actions: PopoverAction[];
  triggerButton?: React.ReactNode;
  rowUuid: string;
  openPopover: string | null;
  setOpenPopover: (uuid: string | null) => void;
  onClick?: () => void;
}> = ({ actions, triggerButton, rowUuid, openPopover, setOpenPopover }) => {
  return (
    <NextUIPopover
      placement="bottom-end"
      shouldCloseOnBlur={false}
      isOpen={openPopover === rowUuid}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpenPopover(null);
      }}
    >
      <PopoverTrigger className='z-10'>
        {triggerButton || (
          <Button onClick={() => setOpenPopover(rowUuid)}>
            <i className="ri-more-2-fill z-0"></i>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-1 bg-white shadow-md flex flex-col gap-2">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`
                text-lg
                cursor-pointer
                hover:bg-gray-200
                py-0.5
                px-2
                rounded-[2px]
                flex
                items-center
                gap-2
                ${action.className || ''}
              `}
              onClick={() => {
                setOpenPopover(null);
                action.onClick();
              }}
            >
              {action.icon}
              {action.label}
            </div>
          ))}
        </div>
      </PopoverContent>
    </NextUIPopover>
  );
};

export default TableActionPopover;
