import React, { useState, useEffect } from 'react';
import Input from '@potta/components/input';
import CurrencyInput from '@potta/components/currencyInput';
import Select from '@potta/components/select';
import Button from '@potta/components/button';
import CustomDatePicker from '@potta/components/customDatePicker';
import SearchableSelect from '@potta/components/searchableSelect';
import { CalendarDate } from '@internationalized/date';
import FileUpload from '@potta/components/fileUpload';
import { accountsApi } from '@potta/app/(routes)/accounting/utils/api';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { reimbursementSchema } from '../utils/validations';
import {
  useCreateReimbursement,
  useUpdateReimbursement,
  useGetEmployees,
} from '../hooks/useReimbursements';
import {
  Reimbursement,
  CreateReimbursementRequest,
  REIMBURSEMENT_TYPE_OPTIONS,
  EXPENSE_TYPE_OPTIONS,
} from '../utils/api-types';

// Helper to convert Date to CalendarDate
function dateToCalendarDate(date: Date | undefined): CalendarDate | null {
  if (!date || isNaN(date.getTime())) return null;
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

type ReimbursementFormData = yup.InferType<typeof reimbursementSchema>;

interface ReimbursementFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: Reimbursement;
}

const ReimbursementForm = ({
  onSubmit,
  onClose,
  initialData,
}: ReimbursementFormProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ReimbursementFormData>({
    resolver: yupResolver(reimbursementSchema),
    defaultValues: {
      employeeId: initialData?.employeeId || '',
      amount: initialData?.amount || 0,
      type: initialData?.type || 'mileage',
      expenseType: initialData?.expenseType || '',
      description: initialData?.description || '',
      date: initialData?.createdAt
        ? new Date(initialData.createdAt)
        : undefined,
    },
  });

  const watchedType = watch('type');

  // API hooks
  const createMutation = useCreateReimbursement();
  const updateMutation = useUpdateReimbursement();
  const { data: employees, isLoading: employeesLoading } = useGetEmployees({
    limit: 100,
    sortBy: ['firstName:ASC'],
  });

  // Get expense type options based on selected type
  const expenseTypeOptions =
    EXPENSE_TYPE_OPTIONS[watchedType as keyof typeof EXPENSE_TYPE_OPTIONS] ||
    [];

  // Convert employees to options
  const employeeOptions =
    employees?.data?.map((emp: any) => ({
      label: `${emp.firstName} ${emp.lastName}`,
      value: emp.uuid,
    })) || [];

  // Reset expense type when type changes
  useEffect(() => {
    if (watchedType && expenseTypeOptions.length > 0) {
      const currentExpenseType = watch('expenseType');
      const isValidExpenseType = expenseTypeOptions.some(
        (option) => option.value === currentExpenseType
      );

      if (!isValidExpenseType) {
        setValue('expenseType', expenseTypeOptions[0].value);
      }
    }
  }, [watchedType, expenseTypeOptions, setValue, watch]);

  // Fetch expense accounts
  const [accountOptions, setAccountOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  useEffect(() => {
    setAccountsLoading(true);
    setAccountsError(null);
    accountsApi
      .getByType('Expense')
      .then((data) => {
        const accounts = data.data || data;
        setAccountOptions(
          accounts.map((acc: any) => ({
            label: acc.name + (acc.code ? ` (${acc.code})` : ''),
            value: acc.uuid || acc.id || acc._id || acc.name,
          }))
        );
      })
      .catch((err) => {
        setAccountsError('Failed to load accounts');
      })
      .finally(() => setAccountsLoading(false));
  }, []);

  const handleDateChange = (calendarDate: CalendarDate | null) => {
    if (calendarDate) {
      setValue(
        'date',
        new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day)
      );
    } else {
      setValue('date', undefined);
    }
  };

  const onFormSubmit = (data: ReimbursementFormData) => {
    const submitData: CreateReimbursementRequest = {
      employeeId: data.employeeId,
      amount: Number(data.amount),
      type: data.type as any,
      expenseType: data.expenseType,
      description: data.description,
    };

    if (initialData) {
      // Update existing reimbursement
      updateMutation.mutate(
        { uuid: initialData.uuid, data: submitData },
        {
          onSuccess: () => {
            onSubmit(submitData);
            onClose();
            reset();
          },
        }
      );
    } else {
      // Create new reimbursement
      createMutation.mutate(submitData, {
        onSuccess: () => {
          onSubmit(submitData);
          onClose();
          reset();
        },
      });
    }
  };

  return (
    <form
      className="grid grid-cols-1 md:grid-cols-2 mb-10 gap-6 w-full max-w-5xl"
      onSubmit={handleSubmit(onFormSubmit)}
    >
      <div className="flex flex-col gap-4">
        <Controller
          name="employeeId"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              label="Employee"
              options={employeeOptions}
              selectedValue={field.value}
              onChange={(val: string) => field.onChange(val)}
              placeholder="Select employee"
              error={errors.employeeId?.message}
              isLoading={employeesLoading}
            />
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Type"
              options={REIMBURSEMENT_TYPE_OPTIONS}
              selectedValue={field.value}
              onChange={(val: string) => field.onChange(val)}
              bg=""
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="expenseType"
          control={control}
          render={({ field }) => (
            <Select
              label="Expense Type"
              options={expenseTypeOptions}
              selectedValue={field.value}
              onChange={(val: string) => field.onChange(val)}
              bg=""
              error={errors.expenseType?.message}
            />
          )}
        />

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Amount"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder="Amount"
              required
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <CustomDatePicker
              label="Date"
              placeholder="Pick a date"
              value={dateToCalendarDate(field.value)}
              onChange={handleDateChange}
              isRequired
              errors={errors.date?.message}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              name="description"
              label="Description"
              value={field.value}
              onchange={(e) => field.onChange(e.target.value)}
              placeholder="Description"
              type="text"
              required
              errors={errors.description?.message}
            />
          )}
        />

        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
          <p>
            <strong>Note:</strong> This reimbursement will be submitted for
            approval.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 flex justify-end space-x-3">
        <Button
          type="submit"
          className="!py-3 !px-6"
          text={initialData ? 'Update' : 'Submit'}
          theme="default"
          disabled={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </form>
  );
};

export default ReimbursementForm;
