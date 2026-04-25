import Input from '@potta/components/input';
import Select from '@potta/components/select';
import React from 'react';
import { Controller, UseFormRegister, Control, FieldErrors, FieldError } from 'react-hook-form';

interface Props {
  register: UseFormRegister<any>;
  control: Control<any>; // Add control prop
  errors: FieldErrors; // Use FieldErrors instead of FieldError
}

const ProductMeasureEnum = [
  { value: 'Pieces', label: 'Pieces' },
  { value: 'Gallons', label: 'Gallons' },
  { value: 'Others', label: 'Others' },
];

const Inventory: React.FC<Props> = ({ register, control, errors }) => {
  return (
    <div className="flex mt-4 space-x-3 w-full">
      <div className="mt-2">
        <Controller
          name="unitOfMeasure"
          control={control}
          render={({ field }) => (
            <Select
              options={ProductMeasureEnum}
              selectedValue={field.value}
              onChange={field.onChange}
              bg="bg-white"
              name="Unit Of Measurement"
              label="Unit of Measurement"
              
            />
          )}
        />
        {errors?.unitOfMeasure?.message && (
          <small className="text-red-500">
            {typeof errors.unitOfMeasure.message === 'string'
              ? errors.unitOfMeasure.message
              : 'Invalid input'}
          </small>
        )}
      </div>

      <div className="mt-2">
        <Input
          label="Inventory Level"
          type="number"
          name="inventoryLevel"
          placeholder="Enter Inventory Level"
          register={register}
          errors={errors?.inventoryLevel as FieldError | undefined}
        />
      </div>
    </div>
  );
};

export default Inventory;
