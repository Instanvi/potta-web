import React from 'react';

type CardNumberInputProps = {
  value: string;
  onChange: (v: string) => void;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

const formatCardNumber = (val: string) => {
  // Remove all non-digits
  let digits = val.replace(/\D/g, '').slice(0, 16);
  // Add space every 4 digits
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const CardNumberInput: React.FC<CardNumberInputProps> = ({
  value,
  onChange,
  name,
  label,
  placeholder = 'e.g. 1234 5678 9012 3456',
  required = false,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    onChange(formatted);
  };
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <span className="mb-3 text-base font-medium text-foreground">
          {label}
          {required && <span className=" text-red-500">*</span>}
        </span>
      )}
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleChange}
        maxLength={19}
        autoComplete="cc-number"
        placeholder={placeholder}
        className="mt-2 h-10 w-full tracking-widest rounded-t-[2px] rounded-b-none border-0 border-b border-black/15 bg-zinc-50 px-3 text-sm font-normal leading-none text-foreground outline-none shadow-none placeholder:text-black/35 focus-visible:border-primary focus-visible:ring-0"
        inputMode="numeric"
        pattern="[0-9 ]*"
      />
    </div>
  );
};

export default CardNumberInput;
