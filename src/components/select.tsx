'use client';

import React from 'react';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { FIELD_LABEL } from '@potta/lib/field-styles';
import { cn } from '@potta/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  border?: boolean;
  selectedValue: string;
  onChange: (value: string) => void;
  bg?: string;
  name?: string;
  label?: string;
  required?: boolean;
  outline?: boolean;
  labelClass?: string;
  isDisabled?: boolean;
  SelectClass?: string;
  error?: string;
  /** Shown when nothing is selected; defaults to `name`. */
  placeholder?: string;
}

/** Radix forbids SelectItem value=""; map empty options through this sentinel. */
const EMPTY_OPTION_VALUE = '__empty__';

/** Shadcn-backed select adapter — keeps the legacy Select props API. */
const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onChange,
  name,
  label,
  required,
  labelClass,
  isDisabled = false,
  SelectClass,
  error,
  placeholder,
}) => {
  const hasEmptyOption = options.some((option) => option.value === '');
  const value =
    selectedValue === '' && hasEmptyOption
      ? EMPTY_OPTION_VALUE
      : selectedValue || undefined;
  const emptyLabel = placeholder || name || 'Select…';

  return (
    <div className={cn('w-full', SelectClass)}>
      {label && (
        <div className={cn(FIELD_LABEL, labelClass)}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </div>
      )}
      <ShadcnSelect
        value={value}
        onValueChange={(next) =>
          onChange(next === EMPTY_OPTION_VALUE ? '' : next)
        }
        disabled={isDisabled}
      >
        <SelectTrigger
          aria-invalid={Boolean(error) || undefined}
          className={cn(error && 'border-destructive')}
        >
          <SelectValue placeholder={emptyLabel} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const itemValue =
              option.value === '' ? EMPTY_OPTION_VALUE : String(option.value);
            return (
              <SelectItem key={itemValue} value={itemValue}>
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </ShadcnSelect>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
