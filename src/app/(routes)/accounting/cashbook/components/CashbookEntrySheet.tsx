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
import { FormDatePicker } from '@potta/components/ui/date-picker';
import Select from '@potta/components/select';
import { today } from '../../../_shared/format';
import {
  useCashAccounts,
  useCreateCashbookEntry,
  useUpdateCashbookEntry,
} from '../hooks';
import {
  CashbookCategory,
  CashbookCurrency,
  CashbookDirection,
  CashbookEntry,
  CashbookEntryType,
  categoriesFor,
} from '../utils/types';

const schema = yup.object({
  direction: yup.mixed<CashbookDirection>().oneOf(['IN', 'OUT']).required(),
  entryType: yup
    .mixed<CashbookEntryType>()
    .oneOf(['RECEIPT', 'PAYMENT', 'TRANSFER'])
    .required(),
  category: yup.string().default(''),
  amount: yup
    .number()
    .typeError('Enter an amount')
    .moreThan(0, 'Amount must be greater than 0')
    .required('Amount is required'),
  currency: yup.mixed<CashbookCurrency>().oneOf(['XAF', 'USD', 'EUR']).required(),
  transactionDate: yup.string().required('Date is required'),
  cashAccountId: yup.string().default(''),
  reference: yup.string().default(''),
  counterparty: yup.string().default(''),
  narration: yup.string().default(''),
});

type FormValues = yup.InferType<typeof schema>;

const defaults = (entry?: CashbookEntry | null): FormValues => ({
  direction: entry?.direction ?? 'OUT',
  entryType: entry?.entryType ?? 'PAYMENT',
  category: entry?.category ?? '',
  amount: entry ? Number(entry.amount) : (undefined as unknown as number),
  currency: entry?.currency ?? 'XAF',
  transactionDate: entry?.transactionDate
    ? String(entry.transactionDate).slice(0, 10)
    : today(),
  cashAccountId: entry?.cashAccountId ?? '',
  reference: entry?.reference ?? '',
  counterparty: entry?.counterparty ?? '',
  narration: entry?.narration ?? '',
});

interface Props {
  open: boolean;
  entry: CashbookEntry | null;
  onClose: () => void;
}

const CashbookEntrySheet = ({ open, entry, onClose }: Props) => {
  const isEdit = !!entry;
  const { data: cashAccounts = [], isLoading: accountsLoading } = useCashAccounts();
  const createMutation = useCreateCashbookEntry();
  const updateMutation = useUpdateCashbookEntry();
  const pending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: defaults(entry),
  });

  useEffect(() => {
    if (open) reset(defaults(entry));
  }, [open, entry, reset]);

  const direction = watch('direction');
  const categoryOptions = categoriesFor(direction).map((c) => ({
    value: c.value as string,
    label: c.label,
  }));

  const onSubmit = (values: FormValues) => {
    if (!isEdit && !values.category) {
      setError('category', { message: 'Category is required' });
      return;
    }
    const payload = {
      ...values,
      category: (values.category || undefined) as CashbookCategory,
      cashAccountId: values.cashAccountId || undefined,
      reference: values.reference || undefined,
      counterparty: values.counterparty || undefined,
      narration: values.narration || undefined,
    };
    if (isEdit) {
      updateMutation.mutate({ id: entry!.uuid, data: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto rounded-none sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit cashbook entry' : 'New cashbook entry'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="flex gap-1 rounded-[2px] bg-brand-subtle p-1">
            {(['IN', 'OUT'] as CashbookDirection[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setValue('direction', d);
                  setValue('entryType', d === 'IN' ? 'RECEIPT' : 'PAYMENT');
                  setValue('category', '');
                }}
                className={`h-9 flex-1 rounded-[2px] text-sm font-medium transition-colors ${
                  direction === d
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {d === 'IN' ? 'Money in' : 'Money out'}
              </button>
            ))}
          </div>

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label={isEdit ? 'Category (leave empty to keep)' : 'Category'}
                required={!isEdit}
                options={categoryOptions}
                selectedValue={field.value ?? ''}
                onChange={field.onChange}
                bg="bg-white"
                name="Select category"
                error={errors.category?.message}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              name="amount"
              label="Amount"
              required
              register={register}
              errors={errors.amount}
            />
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  label="Currency"
                  options={[
                    { value: 'XAF', label: 'XAF' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormDatePicker
              control={control}
              name="transactionDate"
              id="transactionDate"
              label="Date"
              required
            />
            <Controller
              name="entryType"
              control={control}
              render={({ field }) => (
                <Select
                  label="Entry type"
                  options={[
                    { value: 'RECEIPT', label: 'Receipt' },
                    { value: 'PAYMENT', label: 'Payment' },
                    { value: 'TRANSFER', label: 'Transfer' },
                  ]}
                  selectedValue={field.value}
                  onChange={field.onChange}
                  bg="bg-white"
                />
              )}
            />
          </div>

          <Controller
            name="cashAccountId"
            control={control}
            render={({ field }) => (
              <Select
                label="Cash / bank account"
                options={[
                  { value: '', label: 'Default cash account (571)' },
                  ...cashAccounts.map((a) => ({
                    value: a.uuid,
                    label: `${a.code} · ${a.name}`,
                  })),
                ]}
                selectedValue={field.value ?? ''}
                onChange={field.onChange}
                bg="bg-white"
                name={accountsLoading ? 'Loading accounts...' : 'Default cash account (571)'}
              />
            )}
          />

          <Input
            type="text"
            name="counterparty"
            label="Counterparty"
            placeholder="Customer, vendor or person"
            register={register}
          />
          <Input
            type="text"
            name="reference"
            label="Reference"
            placeholder="Receipt or voucher number"
            register={register}
          />
          <Input
            type="text"
            name="narration"
            label="Narration"
            placeholder="What was this for?"
            register={register}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button text="Cancel" type="button" theme="gray" color onClick={onClose} />
            <Button
              text={isEdit ? 'Save changes' : 'Record entry'}
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

export default CashbookEntrySheet;
