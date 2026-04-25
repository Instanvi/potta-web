import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';

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
  height,
  onchange,
  disabled,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <span className="mb-3 text-gray-900 font-medium">{label}</span>}
      <textarea
        value={value}
        placeholder={placeholder}
        {...(register ? register(name) : {})}
        onChange={onchange}
        disabled={disabled}
        className={`w-full ${
          height ? 'py-1.5' : 'py-2.5'
        } px-4 border border-gray-200 rounded-[2px] outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
        }
   `}
      />
      {errors ? (
        <small className="col-span-2 text-red-500">{errors?.message}</small>
      ) : null}
    </div>
  );
};

export default TextArea;
