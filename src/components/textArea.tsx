import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { FIELD_TEXTAREA } from '@/lib/field-styles';
import { cn } from '@/lib/utils';

type Props = {
  label?: string;
  className?: string;
  name: string;
  errors?: FieldError | string;
  placeholder?: string;
  register?: UseFormRegister<any>;
  onchange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string | number;
  height?: boolean;
  disabled?: boolean;
};

const TextArea: React.FC<Props> = ({
  label,
  className,
  name,
  placeholder,
  errors,
  register,
  value,
  onchange,
  disabled,
}) => {
  const message =
    typeof errors === 'string' ? errors : errors && 'message' in errors ? errors.message : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && <span className="mb-3 text-sm font-medium text-foreground">{label}</span>}
      <textarea
        value={value}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        onChange={onchange}
        disabled={disabled}
        className={cn(FIELD_TEXTAREA, 'mt-2', message && 'border-destructive')}
      />
      {message ? <small className="col-span-2 text-red-500">{message}</small> : null}
    </div>
  );
};

export default TextArea;
