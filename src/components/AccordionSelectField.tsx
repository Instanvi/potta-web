import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import SearchableSelect, { Option } from './searchableSelect';

interface AccordionSelectFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const AccordionSelectField: React.FC<AccordionSelectFieldProps> = ({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`w-full mb-4 ${className}`} ref={containerRef}>
      <div
        className="flex items-center justify-between border border-gray-200 px-5 py-4 cursor-pointer transition min-h-[56px]"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl text-gray-400">{icon}</span>}
          <div>
            <div className="font-medium text-base text-gray-900">{label}</div>
            <div className="text-gray-500 text-xs">
              {selectedOption ? (
                selectedOption.label
              ) : (
                <span className="italic text-gray-300">{placeholder}</span>
              )}
            </div>
          </div>
        </div>
        <span className="ml-2 text-gray-400 text-xl">
          {open ? <FiChevronUp /> : <FiChevronDown />}
        </span>
      </div>
      {open && (
        <div className="mt-2">
          <SearchableSelect
            options={options}
            selectedValue={value}
            onChange={(val) => {
              onChange(val);
              setOpen(false);
            }}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  );
};

export default AccordionSelectField;
