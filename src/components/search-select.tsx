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
      marginTop: noMarginTop ? 0 : '0.5rem',
    }),
    control: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      minHeight: '40px',
      height: '40px',
      borderRadius: '2px',
      borderWidth: '1px',
      borderColor: state.isFocused ? '#0b5d1e' : 'rgba(0,0,0,0.15)',
      backgroundColor: '#f1f2f4',
      boxShadow: 'none',
      outline: 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#0b5d1e' : 'rgba(0,0,0,0.15)',
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 0.75rem',
    }),
    input: (base: any) => ({
      ...base,
      color: '#111111',
      padding: '0',
      margin: '0',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: 'rgba(0,0,0,0.35)',
      fontSize: '0.875rem',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#111111',
      fontSize: '0.875rem',
    }),
    option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#0b5d1e'
        : state.isFocused
          ? '#f1faf7'
          : 'transparent',
      color: state.isSelected ? 'white' : '#111111',
      cursor: 'pointer',
      fontSize: '0.875rem',
      '&:active': {
        backgroundColor: '#0b5d1e',
        color: 'white',
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
      display: 'none',
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
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      zIndex: 60,
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