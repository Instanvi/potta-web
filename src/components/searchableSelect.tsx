'use client';
import React from 'react';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';
import AsyncSelect from 'react-select/async';

export interface Option {
  value: string;
  label: string;
}

// Overload for single select
interface SearchableSelectSingleProps
  extends Omit<
    ReactSelectProps<Option, false>,
    'onChange' | 'isMulti' | 'value'
  > {
  label?: string;
  labelClass?: string;
  options: Option[];
  selectedValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  required?: boolean;
  error?: string;
  multiple?: false;
  loadOptions?: (inputValue: string) => Promise<Option[]>;
  minInputLength?: number;
}
// Overload for multi select
interface SearchableSelectMultiProps
  extends Omit<
    ReactSelectProps<Option, true>,
    'onChange' | 'isMulti' | 'value'
  > {
  label?: string;
  labelClass?: string;
  options: Option[];
  selectedValue?: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isDisabled?: boolean;
  required?: boolean;
  error?: string;
  multiple: true;
  loadOptions?: (inputValue: string) => Promise<Option[]>;
  minInputLength?: number;
}

type SearchableSelectProps =
  | SearchableSelectSingleProps
  | SearchableSelectMultiProps;

// ✅ Custom styles for react-select
const customStyles = {
  control: (provided: any, state: any, { error }: { error?: string }) => ({
    ...provided,
    borderColor: error
      ? '#ef4444' // Tailwind red-500
      : state.isFocused
      ? '#22c55e'
      : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px #22c55e' : 'none',
    borderRadius: '0px',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    backgroundColor: state.isDisabled ? '#f9fafb' : 'white',
    minHeight: '40px',
    outline: 'none',
    '&:hover': {
      borderColor: error ? '#ef4444' : state.isFocused ? '#22c55e' : '#d1d5db',
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#22c55e'
      : state.isFocused
      ? '#bbf7d0'
      : undefined,
    color: state.isSelected ? 'white' : '#374151',
    '&:active': {
      backgroundColor: '#22c55e',
    },
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
    fontSize: '1rem',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#374151',
    fontSize: '1rem',
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '2px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    zIndex: 20,
  }),
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  labelClass = '',
  options,
  selectedValue,
  onChange,
  placeholder = 'Select...',
  isDisabled = false,
  required = false,
  error,
  multiple = false,
  loadOptions,
  minInputLength = 2,
  ...rest
}) => {
  // If loadOptions is provided, use AsyncSelect
  if (loadOptions) {
    return (
      <div className="w-full">
        {label && (
          <label className={`block mb-2 ${labelClass} !font-medium`}>
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <AsyncSelect
          loadOptions={loadOptions}
          defaultOptions={options}
          value={
            multiple
              ? options.filter((option) =>
                  Array.isArray(selectedValue)
                    ? selectedValue.includes(option.value)
                    : false
                )
              : options.find((option) => option.value === selectedValue) || null
          }
          onChange={(option) => {
            if (multiple) {
              if (Array.isArray(option)) {
                (onChange as (value: string[]) => void)(
                  option.map((o) => o.value)
                );
              } else {
                (onChange as (value: string[]) => void)([]);
              }
            } else {
              if (option) {
                (onChange as (value: string) => void)((option as Option).value);
              } else {
                (onChange as (value: string) => void)('');
              }
            }
          }}
          placeholder={placeholder}
          isDisabled={isDisabled}
          isClearable
          isSearchable
          cacheOptions={false}
          styles={{
            ...customStyles,
            control: (provided: any, state: any) =>
              customStyles.control(provided, state, { error }),
          }}
          className={`react-select-container ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          classNamePrefix="react-select"
          {...rest}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  // Otherwise use regular ReactSelect
  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-2 ${labelClass} !font-medium`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <ReactSelect
        options={options}
        isMulti={multiple}
        value={
          multiple
            ? options.filter((option) =>
                Array.isArray(selectedValue)
                  ? selectedValue.includes(option.value)
                  : false
              )
            : options.find((option) => option.value === selectedValue) || null
        }
        onChange={(option) => {
          if (multiple) {
            if (Array.isArray(option)) {
              (onChange as (value: string[]) => void)(
                option.map((o) => o.value)
              );
            } else {
              (onChange as (value: string[]) => void)([]);
            }
          } else {
            if (option) {
              (onChange as (value: string) => void)((option as Option).value);
            } else {
              (onChange as (value: string) => void)('');
            }
          }
        }}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable
        isSearchable
        styles={{
          ...customStyles,
          control: (provided: any, state: any) =>
            customStyles.control(provided, state, { error }),
        }}
        className={`react-select-container ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        classNamePrefix="react-select"
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
