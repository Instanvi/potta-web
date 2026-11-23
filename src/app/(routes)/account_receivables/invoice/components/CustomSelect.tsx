'use client';

import React, { FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select';
import { cn } from '@potta/lib/utils';

export type IOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: IOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
};

/** Toolbar filter select — shadcn Select with shared field surface. */
const CustomSelect: FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select',
  className,
}) => (
  <Select
    value={value || undefined}
    onValueChange={(v) => onChange(v || null)}
  >
    <SelectTrigger
      className={cn('w-fit min-w-[10rem] shrink-0', className)}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default CustomSelect;
