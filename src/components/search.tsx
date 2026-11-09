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
    <div className={`relative flex items-center bg-white ${className || 'w-fit'}`}>
      <RiSearchLine className="pointer-events-none absolute left-3 text-lg text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder || 'Search'}
        value={value}
        onChange={onChange}
        className={`h-11 pl-10 pr-10 ${className ? 'w-full' : 'w-full sm:w-[450px]'}`}
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
