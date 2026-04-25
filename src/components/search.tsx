'use client';
import React from 'react';
import { Input } from './shadcn/input';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';

interface SearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
}

const Search = ({
  placeholder,
  value,
  onChange,
  onClear,
  className,
}: SearchProps) => {
  return (
    <div className={`relative bg-white flex items-center w-fit ${className || ''}`}>
      <RiSearchLine className="absolute left-3 text-gray-400 text-lg pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder || 'Search'}
        value={value}
        onChange={onChange}
        className="pl-10 pr-10 h-11  border-gray-300 focus:ring-2 focus:ring-green-500 w-[450px]"
        aria-label={placeholder || 'Search'}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Clear search"
        >
          <RiCloseLine className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default Search;
