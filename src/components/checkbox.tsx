'use client';

import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="opacity-0 absolute h-5 w-5 cursor-pointer"
        />
        <div
          className={`border rounded w-5 h-5 flex flex-shrink-0 justify-center items-center mr-2 ${
            checked
              ? 'bg-green-600 border-green-600'
              : 'border-gray-300 bg-white'
          } transition-colors`}
        >
          {checked && (
            <svg
              className="fill-current text-white w-3 h-3 pointer-events-none"
              viewBox="0 0 20 20"
            >
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          )}
        </div>
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-600 cursor-pointer"
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default Checkbox;
