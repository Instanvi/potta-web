import React, { useState, Fragment, ReactNode } from 'react';
import {
  Transition,
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';

import {
  PopoverTrigger,
  PopoverContent,
  Popover as NextUIPopover,
  Button,
} from '@nextui-org/react';
interface CustomPopoverProps {
  children: ReactNode;
  icon?: string;
}

export default function CustomPopover({
  children,
  icon,
}: CustomPopoverProps): JSX.Element {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  return (
    <Popover className="relative z-[10000000]">
      <PopoverButton className={`outline-none`}>
        <div
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="flex border rounded-[2px] cursor-pointer py-1.5 px-2"
        >
          {icon ? (
            <span
              className={`inline-block w-4 h-4 mr-2 text-gray-500 ${icon}`}
            />
          ) : (
            <span>Action</span>
          )}
        </div>
      </PopoverButton>

      <PopoverPanel>{children}</PopoverPanel>
    </Popover>
  );
}

export type NextPopoverAction = {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
};

// Popover Component
export const NextPopover: React.FC<{
  actions: NextPopoverAction[];
  triggerButton?: React.ReactNode;
  rowUuid: string;
  openPopover: string | null;
  setOpenPopover: (uuid: string | null) => void;
  onClick?: () => void;
}> = ({ actions, rowUuid, triggerButton, openPopover, setOpenPopover }) => {
  return (
    <NextUIPopover
      placement="bottom"
      shouldCloseOnBlur={false}
      isOpen={openPopover === rowUuid}
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpenPopover(null);
      }}
    >
      <PopoverTrigger>
        <div onClick={() => setOpenPopover(rowUuid)}>
          {' '}
          {triggerButton || (
            <Button>
              <i className="ri-more-2-fill"></i>
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className=" bg-white shadow-md flex flex-col">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`
text-slate-500
                cursor-pointer
                hover:bg-gray-200
                py-1
                px-6
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
