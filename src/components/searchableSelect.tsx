'use client';
import React from 'react';
import ReactSelect, { Props as ReactSelectProps } from 'react-select';
import AsyncSelect from 'react-select/async';
import { FIELD_LABEL } from '@/lib/field-styles';
import { cn } from '@potta/lib/utils';

export interface Option {
  value: string;
  label: string;
}

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
  /** @deprecated One field system — always outlined. */
  outlined?: boolean;
}

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
  /** @deprecated One field system — always outlined. */
  outlined?: boolean;
}

type SearchableSelectProps =
  | SearchableSelectSingleProps
  | SearchableSelectMultiProps;

const FIELD_BG = '#f1f2f4';

function buildStyles(error?: string) {
  return {
    control: (provided: any, state: any) => ({
      ...provided,
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: error
        ? '#e5181b'
        : state.isFocused
          ? '#0b5d1e'
          : 'rgba(0,0,0,0.15)',
      boxShadow: 'none',
      borderRadius: '2px',
      paddingTop: '0',
      paddingBottom: '0',
      paddingLeft: '0.25rem',
      paddingRight: '0.25rem',
      backgroundColor: state.isDisabled ? 'rgba(0,0,0,0.04)' : FIELD_BG,
      minHeight: '40px',
      height: '40px',
      outline: 'none',
      '&:hover': {
        borderColor: error
          ? '#e5181b'
          : state.isFocused
            ? '#0b5d1e'
            : 'rgba(0,0,0,0.15)',
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: '38px',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#0b5d1e'
        : state.isFocused
          ? '#f1faf7'
          : undefined,
      color: state.isSelected ? 'white' : '#111111',
      fontSize: '0.875rem',
      '&:active': {
        backgroundColor: '#0b5d1e',
        color: 'white',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'rgba(0,0,0,0.35)',
      fontSize: '0.875rem',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#111111',
      fontSize: '0.875rem',
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '2px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      zIndex: 60,
    }),
  };
}

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
  outlined: _outlined,
  ...rest
}) => {
  const styles = buildStyles(error);
  const labelClasses = cn(FIELD_LABEL, labelClass);

  const sharedProps = {
    placeholder,
    isDisabled,
    isClearable: true as const,
    isSearchable: true as const,
    styles,
    className: `react-select-container ${
      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
    }`,
    classNamePrefix: 'react-select',
  };

  if (loadOptions) {
    return (
      <div className="w-full space-y-1">
        {label ? (
          <label className={labelClasses}>
            {label} {required ? <span className="text-red-500">*</span> : null}
          </label>
        ) : null}
        <AsyncSelect
          loadOptions={loadOptions}
          defaultOptions={options}
          value={
            multiple
              ? options.filter((option) =>
                  Array.isArray(selectedValue)
                    ? selectedValue.includes(option.value)
                    : false,
                )
              : options.find((option) => option.value === selectedValue) || null
          }
          onChange={(option) => {
            if (multiple) {
              if (Array.isArray(option)) {
                (onChange as (value: string[]) => void)(
                  option.map((o) => o.value),
                );
              } else {
                (onChange as (value: string[]) => void)([]);
              }
            } else if (option) {
              (onChange as (value: string) => void)((option as Option).value);
            } else {
              (onChange as (value: string) => void)('');
            }
          }}
          cacheOptions={false}
          {...sharedProps}
          {...rest}
        />
        {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="w-full space-y-1">
      {label ? (
        <label className={labelClasses}>
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      ) : null}
      <ReactSelect
        options={options}
        isMulti={multiple}
        value={
          multiple
            ? options.filter((option) =>
                Array.isArray(selectedValue)
                  ? selectedValue.includes(option.value)
                  : false,
              )
            : options.find((option) => option.value === selectedValue) || null
        }
        onChange={(option) => {
          if (multiple) {
            if (Array.isArray(option)) {
              (onChange as (value: string[]) => void)(
                option.map((o) => o.value),
              );
            } else {
              (onChange as (value: string[]) => void)([]);
            }
          } else if (option) {
            (onChange as (value: string) => void)((option as Option).value);
          } else {
            (onChange as (value: string) => void)('');
          }
        }}
        {...sharedProps}
        {...rest}
      />
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

export default SearchableSelect;
