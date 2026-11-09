'use client';

import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@potta/components/shadcn/select';
import { DatePicker } from '@potta/components/ui/date-picker';

interface DateInputProps {
  label?: string;
  placeholder?: string;
  name: string;
  className?: string;
  errors?: FieldError | string;
  register?: UseFormRegister<any>;
  required?: boolean;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  yearRange?: { start: number; end: number };
  disabled?: boolean;
}

/** Date-valued wrapper kept for existing callers; renders the shared shadcn DatePicker. */
export function DateInput({
  label,
  placeholder,
  name,
  className,
  errors,
  register,
  required,
  value,
  onChange,
  yearRange,
  disabled = false,
}: DateInputProps) {
  const valid = value instanceof Date && !Number.isNaN(value.getTime()) ? value : undefined;
  return (
    <div className={className}>
      <DatePicker
        valueType="date"
        label={label}
        placeholder={placeholder}
        name={name}
        required={required}
        disabled={disabled}
        value={valid ?? null}
        onChange={onChange}
        fromYear={yearRange?.start}
        toYear={yearRange?.end}
        error={typeof errors === 'string' ? errors : errors?.message}
      />
      {register && <input type="hidden" {...register(name)} value={valid ? valid.toISOString() : ''} />}
    </div>
  );
}

/** Card expiry (month / year), styled like the other inputs. */
export function MonthYearInput({
  label,
  value,
  onChange,
  required,
  className,
  yearRange = {
    start: new Date().getFullYear(),
    end: new Date().getFullYear() + 15,
  },
}: {
  label?: string;
  value?: { month: number; year: number };
  onChange?: (val: { month: number; year: number }) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  yearRange?: { start: number; end: number };
}) {
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, '0') }));
  const years = Array.from({ length: yearRange.end - yearRange.start + 1 }, (_, i) => yearRange.start + i);
  return (
    <div className={className}>
      {label && (
        <span className="mb-2 block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Select
          value={value ? String(value.month).padStart(2, '0') : ''}
          onValueChange={(val) => onChange?.({ month: parseInt(val, 10), year: value ? value.year : years[0] })}
        >
          <SelectTrigger className="w-[84px]">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.label}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">/</span>
        <Select
          value={value ? String(value.year) : ''}
          onValueChange={(val) =>
            onChange?.({ month: value ? value.month : months[0].value, year: parseInt(val, 10) })
          }
        >
          <SelectTrigger className="w-[96px]">
            <SelectValue placeholder="YYYY" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
