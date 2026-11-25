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
  const value = selectedValue || undefined;
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
        onValueChange={onChange}
        disabled={isDisabled}
      >
        <SelectTrigger
          aria-invalid={Boolean(error) || undefined}
          className={cn(error && 'border-destructive')}
        >
          <SelectValue placeholder={emptyLabel} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
