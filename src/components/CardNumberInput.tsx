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
        <span className="mb-3 text-gray-900">
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
        className="w-full tracking-widest py-2.5 px-4 border border-gray-200 rounded-[2px] outline-none mt-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        inputMode="numeric"
        pattern="[0-9 ]*"
      />
    </div>
  );
};

export default CardNumberInput;
