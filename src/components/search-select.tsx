import React, { useEffect, useState, useCallback } from 'react';
import Select, { SingleValue, Props as SelectProps } from 'react-select';
import debounce from 'lodash/debounce';
import AsyncSelect from 'react-select/async';

export interface Option {
  label: string;
  value: string | number;
}

interface SearchSelectProps extends Omit<SelectProps<Option, false>, 'value' | 'onChange'> {
  label?: string | React.ReactNode;
  error?: string;
  value?: Option | null;
  onChange?: (value: Option | null) => void;
  loadOptions?: (inputValue: string) => Promise<Option[]>;
  options?: Option[];
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  minInputLength?: number;
  isAsync?: boolean;
  required?: boolean;
  noMarginTop?: boolean; // New prop to control margin top
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  error,
  value,
  onChange,
  loadOptions,
  options = [],
  placeholder = 'Search...',
  isSearchable = true,
  isClearable = true,
  minInputLength = 0,
  isAsync = false,
  required = false,
  className,
  noMarginTop = false, // Default to false to maintain backward compatibility
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dynamicOptions, setDynamicOptions] = useState<Option[]>(options);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Update dynamicOptions when options prop changes
  useEffect(() => {
    setDynamicOptions(options);
  }, [options]);

  // Debounced function to load options
  const debouncedLoadOptions = useCallback(
    debounce(async (input: string) => {
      if (!loadOptions || input.length < minInputLength) return;

      setIsLoading(true);
      setFetchError(null);

      try {
        const results = await loadOptions(input);
        setDynamicOptions(results);
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : 'Failed to fetch options');
        setDynamicOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [loadOptions, minInputLength]
  );

  // Handle input change
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (newValue.length >= minInputLength) {
      debouncedLoadOptions(newValue);
    }
  };

  // Async load options for AsyncSelect
  const loadOptionsAsync = async (inputValue: string) => {
    if (inputValue.length < minInputLength) {
      return [];
    }

    try {
      if (loadOptions) {
        return await loadOptions(inputValue);
      }
      return [];
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch options');
      return [];
    }
  };

  const customStyles = {
    container: (base: any) => ({
      ...base,
      marginTop: noMarginTop ? 0 : '0.5rem', // Conditionally apply margin top
    }),
    control: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      minHeight: '46px',
      padding: '0.25rem 0', // to match py-2.5
      borderRadius: '2px', // rounded-[2px]
      borderColor: state.isFocused ? '#22c55e' : '#e5e7eb', // border-gray-200, focus:border-blue-500
      boxShadow: state.isFocused ? '0 0 0 2px #22c55e' : 'none', // focus:ring-2 focus:ring-blue-500
      '&:hover': {
        borderColor: state.isFocused ? '#22c55e' : '#e5e7eb',
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 1rem', // px-4
    }),
    input: (base: any) => ({
      ...base,
      color: '#111827',
      padding: '0',
      margin: '0',

    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#111827',
    }),
    option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
          ? '#f3f4f6'
          : 'transparent',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#3b82f6',
      },
    }),
    loadingMessage: (base: any) => ({
      ...base,
      color: '#6b7280',
    }),
    noOptionsMessage: (base: any) => ({
      ...base,
      color: '#6b7280',
    }),
    indicatorSeparator: () => ({
      display: 'none', // Remove the separator
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: '0 0.5rem',
    }),
    clearIndicator: (base: any) => ({
      ...base,
      padding: '0 0.5rem',
    }),
    menu: (base: any) => ({
      ...base,
      marginTop: '4px',
      borderRadius: '2px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
  };

  const SelectComponent = isAsync ? AsyncSelect : Select;

  return (
    <div className={`w-full `}>
      {label && (
        <span className="mb-3 text-gray-900 text-lg font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <SelectComponent
        className="w-full"
        classNamePrefix="search-select"
        value={value}
        onChange={(newValue: Option | null) => onChange?.(newValue)}
        isSearchable={isSearchable}
        isClearable={isClearable}
        placeholder={placeholder}
        isLoading={isLoading}
        options={isAsync ? undefined : options}
        loadOptions={isAsync ? loadOptionsAsync : undefined}
        onInputChange={(newValue) => handleInputChange(newValue)}
        noOptionsMessage={({ inputValue }) => {
          if (fetchError) return fetchError;
          if (inputValue.length < minInputLength) {
            return `Please enter ${minInputLength} or more characters`;
          }
          return 'No options found';
        }}
        loadingMessage={() => 'Loading...'}
        styles={customStyles}
        {...props}
      />
      {error && (
        <small className="col-span-2 text-red-500">{error}</small>
      )}
    </div>
  );
};

export default SearchSelect;