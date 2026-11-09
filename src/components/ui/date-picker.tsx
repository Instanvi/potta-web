'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { cn } from '@potta/lib/utils';
import { Calendar } from '@potta/components/shadcn/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@potta/components/shadcn/popover';

/** 'YYYY-MM-DD' in local time (no UTC day shift). */
export const toDateString = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Accepts Date, 'YYYY-MM-DD' (read as a local day) or a full ISO string. */
export const parseDateValue = (value?: string | Date | null): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  const d = day ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3])) : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const DISPLAY_FORMAT = 'dd MMM yyyy';
const CURRENT_YEAR = new Date().getFullYear();

const triggerClass = (hasValue: boolean, error?: string, disabled?: boolean) =>
  cn(
    'flex h-11 w-full items-center gap-2 rounded-[2px] border bg-background px-3 text-left text-sm transition-colors',
    'focus:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/30',
    error ? 'border-destructive' : 'border-input hover:border-black/20',
    !hasValue && 'text-muted-foreground/70',
    disabled && 'cursor-not-allowed opacity-60'
  );

const FieldLabel = ({ label, required, htmlFor }: { label?: React.ReactNode; required?: boolean; htmlFor?: string }) =>
  label ? (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive"> *</span>}
    </label>
  ) : null;

const FieldError = ({ error }: { error?: string }) =>
  error ? <small className="mt-1 block text-xs text-destructive">{error}</small> : null;

interface BaseDatePickerProps {
  label?: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  error?: string;
  min?: string | Date | null;
  max?: string | Date | null;
  fromYear?: number;
  toYear?: number;
  className?: string;
  id?: string;
  name?: string;
  align?: 'start' | 'center' | 'end';
}

export type DatePickerProps = BaseDatePickerProps &
  (
    | { valueType?: 'string'; value?: string | null; onChange?: (value: string) => void }
    | { valueType: 'date'; value?: Date | null; onChange?: (value: Date | undefined) => void }
  );

/** shadcn date picker (Popover + Calendar) with month/year dropdowns. Emits 'YYYY-MM-DD' unless valueType="date". */
export function DatePicker(props: DatePickerProps) {
  const {
    label,
    placeholder = 'Pick a date',
    required,
    disabled,
    clearable,
    error,
    min,
    max,
    fromYear = CURRENT_YEAR - 100,
    toYear = CURRENT_YEAR + 10,
    className,
    id,
    name,
    align = 'start',
  } = props;
  const [open, setOpen] = React.useState(false);
  const selected = parseDateValue(props.value ?? undefined);
  const minDate = parseDateValue(min ?? undefined);
  const maxDate = parseDateValue(max ?? undefined);
  const [month, setMonth] = React.useState<Date>(selected ?? new Date());

  React.useEffect(() => {
    if (open) setMonth(selected ?? maxDate ?? new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const emit = (d: Date | undefined) => {
    if (props.valueType === 'date') props.onChange?.(d);
    else props.onChange?.(d ? toDateString(d) : '');
  };

  return (
    <div className={cn('w-full', className)}>
      <FieldLabel label={label} required={required} htmlFor={id} />
      <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <button
            id={id}
            name={name}
            type="button"
            disabled={disabled}
            aria-invalid={!!error}
            className={triggerClass(!!selected, error, disabled)}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{selected ? format(selected, DISPLAY_FORMAT) : placeholder}</span>
            {clearable && selected && !disabled && (
              <span
                role="button"
                aria-label="Clear date"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  emit(undefined);
                }}
                className="rounded-[2px] p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-[2px] p-0" align={align}>
          <Calendar
            mode="single"
            selected={selected}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown-buttons"
            fromYear={fromYear}
            toYear={toYear}
            disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
            onSelect={(d) => {
              emit(d ?? undefined);
              if (d) setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FieldError error={error} />
    </div>
  );
}

export interface DateRangeValue<T extends string | Date = string> {
  from?: T;
  to?: T;
}

type RangePreset = { label: string; range: () => { from: Date; to: Date } };

const RANGE_PRESETS: RangePreset[] = [
  { label: 'Today', range: () => ({ from: new Date(), to: new Date() }) },
  {
    label: 'Last 7 days',
    range: () => {
      const to = new Date();
      return { from: new Date(to.getFullYear(), to.getMonth(), to.getDate() - 6), to };
    },
  },
  {
    label: 'This month',
    range: () => {
      const d = new Date();
      return { from: new Date(d.getFullYear(), d.getMonth(), 1), to: d };
    },
  },
  {
    label: 'Last month',
    range: () => {
      const d = new Date();
      return { from: new Date(d.getFullYear(), d.getMonth() - 1, 1), to: new Date(d.getFullYear(), d.getMonth(), 0) };
    },
  },
  {
    label: 'This year',
    range: () => {
      const d = new Date();
      return { from: new Date(d.getFullYear(), 0, 1), to: d };
    },
  },
];

export type DateRangePickerProps = Omit<BaseDatePickerProps, 'clearable'> & {
  clearable?: boolean;
  presets?: boolean;
} & (
    | { valueType?: 'string'; value?: DateRangeValue<string>; onChange?: (value: DateRangeValue<string>) => void }
    | { valueType: 'date'; value?: DateRangeValue<Date>; onChange?: (value: DateRangeValue<Date>) => void }
  );

/** shadcn range picker: two months, quick presets. Emits 'YYYY-MM-DD' strings unless valueType="date". */
export function DateRangePicker(props: DateRangePickerProps) {
  const {
    label,
    placeholder = 'Pick a date range',
    required,
    disabled,
    clearable,
    error,
    min,
    max,
    fromYear = CURRENT_YEAR - 20,
    toYear = CURRENT_YEAR + 5,
    className,
    id,
    align = 'start',
    presets = true,
  } = props;
  const [open, setOpen] = React.useState(false);
  const from = parseDateValue(props.value?.from ?? undefined);
  const to = parseDateValue(props.value?.to ?? undefined);
  const minDate = parseDateValue(min ?? undefined);
  const maxDate = parseDateValue(max ?? undefined);
  const [draft, setDraft] = React.useState<DateRange | undefined>({ from, to });
  const [month, setMonth] = React.useState<Date>(from ?? new Date());

  React.useEffect(() => {
    if (open) {
      setDraft({ from, to });
      setMonth(from ?? new Date());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const emit = (range: DateRange | undefined) => {
    if (props.valueType === 'date') props.onChange?.({ from: range?.from, to: range?.to ?? range?.from });
    else
      props.onChange?.({
        from: range?.from ? toDateString(range.from) : '',
        to: range?.to ? toDateString(range.to) : range?.from ? toDateString(range.from) : '',
      });
  };

  const text = from
    ? to && toDateString(to) !== toDateString(from)
      ? `${format(from, DISPLAY_FORMAT)} – ${format(to, DISPLAY_FORMAT)}`
      : format(from, DISPLAY_FORMAT)
    : placeholder;

  return (
    <div className={cn('w-full', className)}>
      <FieldLabel label={label} required={required} htmlFor={id} />
      <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <button id={id} type="button" disabled={disabled} className={triggerClass(!!from, error, disabled)}>
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{text}</span>
            {clearable && from && !disabled && (
              <span
                role="button"
                aria-label="Clear dates"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  emit(undefined);
                }}
                className="rounded-[2px] p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col rounded-[2px] p-0 sm:flex-row" align={align}>
          {presets && (
            <div className="flex flex-row flex-wrap gap-1 border-b border-black/[0.06] p-2 sm:w-36 sm:flex-col sm:border-b-0 sm:border-r">
              {RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="rounded-[2px] px-2 py-1.5 text-left text-sm text-foreground hover:bg-brand-subtle hover:text-primary"
                  onClick={() => {
                    const range = preset.range();
                    emit(range);
                    setOpen(false);
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-col">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={draft}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown-buttons"
              fromYear={fromYear}
              toYear={toYear}
              disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
              onSelect={setDraft}
              initialFocus
            />
            <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] p-2">
              <button
                type="button"
                className="h-8 rounded-[2px] border border-input bg-background px-3 text-sm hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!draft?.from}
                className="h-8 rounded-[2px] bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-brand-hover disabled:opacity-50"
                onClick={() => {
                  emit(draft);
                  setOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <FieldError error={error} />
    </div>
  );
}

type FormPickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
};

/** react-hook-form binding for DatePicker (string 'YYYY-MM-DD' by default). */
export function FormDatePicker<T extends FieldValues>({
  control,
  name,
  ...rest
}: FormPickerProps<T> & Omit<BaseDatePickerProps, 'name' | 'error'> & { valueType?: 'string' | 'date' }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        rest.valueType === 'date' ? (
          <DatePicker
            {...rest}
            valueType="date"
            name={field.name}
            value={field.value ?? null}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        ) : (
          <DatePicker
            {...rest}
            valueType="string"
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )
      }
    />
  );
}

/** react-hook-form binding for DateRangePicker; the field holds { from, to } strings. */
export function FormDateRangePicker<T extends FieldValues>({
  control,
  name,
  ...rest
}: FormPickerProps<T> & Omit<BaseDatePickerProps, 'name' | 'error'> & { presets?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DateRangePicker
          {...rest}
          valueType="string"
          value={field.value ?? {}}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
