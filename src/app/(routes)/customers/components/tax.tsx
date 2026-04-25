import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface TaxIDProps {
  register: UseFormRegister<any>;
  errors?: FieldError;
}

const Tax: React.FC<TaxIDProps> = ({ register, errors }) => {
  return (
    <div className="mt-4 w-full">
      <p className="mb-2">Tax ID</p>
      <input
        {...register('taxId')} // Register the input with React Hook Form
        type="text"
        className="w-full border outline-none p-2"
        placeholder="Enter Tax ID"
      />
      {errors && <small className="text-red-500">{errors.message}</small>}
    </div>
  );
};

export default Tax;
