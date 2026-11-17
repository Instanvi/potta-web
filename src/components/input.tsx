import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { FIELD_INPUT } from '@/lib/field-styles';
import { cn } from '@/lib/utils';

// Create a custom error type that can handle both FieldError and simple message objects
type CustomError = FieldError | { message: string };

type Props = {
  label?: string | React.ReactNode;
  type: string;
  className?: string;
  name: string;
  errors?: FieldError | CustomError | string;
  placeholder?: string;
  register?: UseFormRegister<any>;
  onchange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  height?: boolean;
  required?: boolean;
  autocomplete?: boolean;
  labelClass?: string;
  inputClass?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
};

const Input: React.FC<Props> = ({
  label,
  type,
  className,
  name,
  placeholder,
  required,
  errors,
  register,
  value,
  height,
  onchange,
  labelClass,
  autocomplete,
  inputClass,
  disabled,
  min,
  max,
}) => {
  // Get register props if register is provided
  const registerProps = register ? register(name) : {};

  // If onchange is provided, use it instead of register's onChange
  const inputProps = onchange
    ? { ...registerProps, onChange: onchange }
    : registerProps;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <span className={`mb-3 text-base font-medium text-foreground ${labelClass}`}>
          {label}
          {required && <span className=" text-red-500">*</span>}
        </span>
      )}
      <input
        disabled={disabled}
        autoComplete={autocomplete ? 'off' : 'on'}
        name={name}
        type={type}
        max={max}
        min={min}
        value={value}
        {...inputProps}
        placeholder={placeholder}
        className={cn(
          FIELD_INPUT,
          'mt-2',
          height ? 'h-9' : 'h-10',
          errors ? 'border-destructive' : '',
          inputClass,
        )}
      />
      {errors ? (
        <small className="col-span-2 text-red-500">
          {typeof errors === 'string' ? errors : errors.message}
        </small>
      ) : null}
    </div>
  );
};

export default Input;
