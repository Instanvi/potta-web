import React, { FC, useState } from 'react';
import { Icon as Iconify } from '@iconify/react';
import { cn } from '@potta/lib/utils';
import useCloseOnOutsideClick from '@potta/hooks/useCloseOnOutsideClick';
export type IOption = {
  value: string;
  label: string;
};

// Define the props for the Select component
type SelectProps = {
  options: IOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

const CustomSelect: FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const { selectRef } = useCloseOnOutsideClick({ setIsOpen });

  return (
    <div className="relative min-w-[8rem] w-fit shrink-0" ref={selectRef}>
      {/* Select Input */}
      <div
        className="flex items-center justify-between gap-4 p-2.5 transition-colors bg-white border border-gray-200 rounded-none cursor-pointer hover:border-gray-300 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-opacity-20"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={'text-gray-700'}>
          {options.find((option) => option.value === value)?.label ||
            placeholder}
        </span>
        <svg
          className={cn(
            `h-5 w-5 transform transition-transform duration-200 `,
            isOpen && 'rotate-180'
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        {/* <Iconify icon="mdi:chevron-up" width="24" height="24" className={cn("text-gray-500 transition-transform ",
            isOpen && "rotate-180"
        )} /> */}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-none shadow-lg">
          <ul role="listbox" className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700 hover:bg-green-50'
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
