import React, { FC, useState } from 'react';
import { cn } from '@potta/lib/utils';
import useCloseOnOutsideClick from '@potta/hooks/useCloseOnOutsideClick';

export type IOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: IOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

/** Toolbar filter select: same height, border and corners as the search box and other inputs. */
const CustomSelect: FC<SelectProps> = ({ options, value, onChange, placeholder = 'Select' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectRef } = useCloseOnOutsideClick({ setIsOpen });
  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative w-fit min-w-[10rem] shrink-0" ref={selectRef}>
      <div
        className={cn(
          'flex h-11 cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-[2px] border bg-background px-3 text-sm transition-colors',
          isOpen ? 'border-primary ring-[3px] ring-ring/30' : 'border-input hover:border-black/20'
        )}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>{selected?.label || placeholder}</span>
        <svg
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full min-w-max rounded-[2px] border border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <ul role="listbox" className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={cn(
                  'cursor-pointer whitespace-nowrap px-3 py-2 text-sm transition-colors',
                  value === option.value ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-brand-subtle'
                )}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
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
