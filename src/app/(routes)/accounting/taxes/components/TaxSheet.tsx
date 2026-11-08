'use client';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@potta/components/ui/sheet';
import Button from '@potta/components/button';
import Input from '@potta/components/input';
import Select from '@potta/components/select';
import { useCreateTax, useUpdateTax } from '../hooks';
import { Tax, TaxType } from '../utils/api';

const optionalNumber = yup
  .number()
  .transform((value, original) => (original === '' || original === null ? undefined : value))
  .typeError('Must be a number');

const schema = yup.object({
  name: yup.string().trim().required('Name is required'),
  taxId: yup.string().default(''),
  description: yup.string().default(''),
  type: yup.mixed<TaxType>().oneOf(['PERCENTAGE', 'FIXED']).required(),
  rate: optionalNumber.min(0, 'Min 0').max(100, 'Max 100').when('type', {
    is: 'PERCENTAGE',
    then: (s) => s.required('Rate is required'),
  }),
  flatRate: optionalNumber.min(0, 'Min 0').when('type', {
    is: 'FIXED',
    then: (s) => s.required('Amount is required'),
  }),
  isActive: yup.boolean().default(true),
});

type FormValues = yup.InferType<typeof schema>;

const defaults = (tax?: Tax | null): FormValues => ({
  name: tax?.name ?? '',
  taxId: tax?.taxId ?? '',
  description: tax?.description ?? '',
  type: tax?.type ?? 'PERCENTAGE',
  rate: tax?.rate != null ? Number(tax.rate) : undefined,
  flatRate: tax?.flatRate != null ? Number(tax.flatRate) : undefined,
  isActive: tax?.isActive ?? true,
});

interface Props {
  open: boolean;
  tax: Tax | null;
  onClose: () => void;
}

const TaxSheet = ({ open, tax, onClose }: Props) => {
  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();
  const pending = createMutation.isPending || updateMutation.isPending;
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema), defaultValues: defaults(tax) });

  useEffect(() => {
    if (open) reset(defaults(tax));
  }, [open, tax, reset]);

  const type = watch('type');

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      type: values.type,
      taxId: values.taxId || undefined,
      description: values.description || undefined,
      rate: values.type === 'PERCENTAGE' ? values.rate : undefined,
      flatRate: values.type === 'FIXED' ? values.flatRate : undefined,
      isActive: values.isActive,
    };
    if (tax) updateMutation.mutate({ id: tax.uuid, data: payload }, { onSuccess: onClose });
    else createMutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{tax ? 'Edit tax' : 'New tax'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            type="text"
            name="name"
            label="Name"
            placeholder="e.g. VAT"
            required
            register={register}
            errors={errors.name}
          />
          <Input
            type="text"
            name="taxId"
            label="Tax code"
            placeholder="e.g. TVA-19.25"
            register={register}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Type"
                options={[
                  { value: 'PERCENTAGE', label: 'Percentage' },
                  { value: 'FIXED', label: 'Fixed amount' },
                ]}
                selectedValue={field.value}
                onChange={field.onChange}
                bg="bg-white"
              />
            )}
          />
          {type === 'PERCENTAGE' ? (
            <Input
              type="number"
              name="rate"
              label="Rate (%)"
              required
              register={register}
              errors={errors.rate}
            />
          ) : (
            <Input
              type="number"
              name="flatRate"
              label="Amount"
              required
              register={register}
              errors={errors.flatRate}
            />
          )}
          <Input type="text" name="description" label="Description" register={register} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('isActive')} className="accent-green-700" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-4">
            <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
            <Button
              text={tax ? 'Save changes' : 'Create tax'}
              type="submit"
              isLoading={pending}
              disabled={pending}
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default TaxSheet;
