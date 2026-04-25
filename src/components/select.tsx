'use client'; // For Next.js 13+ App Directory
import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  border?: boolean;
  selectedValue: string;
  onChange: any;
  bg: string;
  name?: string;
  label?: string;
  required?: boolean;
  outline?: boolean;
  labelClass?: string;
  isDisabled?: boolean;
  SelectClass?: string;
  error?: string; // Add error prop
}

const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onChange,
  bg,
  name,
  border,
  label,
  required,
  outline,
  SelectClass,
  labelClass,
  isDisabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (value: string) => {
    if (!isDisabled) {
      onChange(value);
      setIsOpen(false);
    }
  };

  return (
    <>
      {label && (
        <div
          className={`text-gray-900 text-lg font-medium mb-[4px] ${labelClass}`}
        >
          {label}
          {required && <span className=" text-red-500">*</span>}
        </div>
      )}
      <div
        className={`relative  inline-block ${
          border ? '' : 'border'
        } w-full md:w-full ${SelectClass} ${error ? 'border-red-500' : ''}`}
      >
        <div
          onClick={toggleDropdown}
          tabIndex={isDisabled ? -1 : 0} // -1 removes from tab order when disabled
          className={`${bg} relative ${
            isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          } px-3 py-2.5 pr-8 ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500 focus:outline-none focus:ring-2'
              : !outline && !isDisabled
              ? 'focus:ring-green-500 focus:border-green-500 focus:outline-none focus:ring-2'
              : ''
          } w-full ${error ? 'border-2' : ''}`}
          aria-disabled={isDisabled}
        >
          <span className="block truncate">
            {options.find((option) => option.value === selectedValue)?.label ||
              name}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 transform transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {!isDisabled && (
          <ul
            className={`absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 ${
              isOpen ? 'block' : 'hidden'
            }`}
          >
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </>
  );
};

export default Select;
