'use client';
import React, { useState, useEffect } from 'react';
import Input from '@potta/components/input';
import Slider from '@potta/components/slideover';
import SearchableSelect from '@potta/components/searchableSelect';
import Button from '@potta/components/button';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar } from '@potta/components/shadcn/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@potta/components/shadcn/popover';
import { Button as ShadcnButton } from '@potta/components/shadcn/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@potta/lib/utils';
import { accountsApi } from '../../utils/api';
import { journalApi } from '../utils/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import CurrencyInput from '@potta/components/currencyInput';
import { Account } from '../../utils/types';
import { CreateJournalPayload } from '../utils/types';

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description: string;
  transactionId?: string;
}

interface JournalPayload {
  type: string;
  date: Date;
  description: string;
  sourceDocumentType?: string;
  lines: JournalLine[];
}

const errorMessage = (err: unknown): string => {
  const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const message = Array.isArray(data?.message) ? data?.message.join(', ') : data?.message;
  return message || 'Failed to create journal';
};

const journalSchema = yup.object().shape({
  type: yup.string().required('Type is required'),
  date: yup.date().required('Date is required'),
  description: yup.string().required('Description is required'),
  sourceDocumentType: yup.string(),
  lines: yup
    .array()
    .of(
      yup.object().shape({
        accountId: yup.string().required('Account is required'),
        debit: yup.number().min(0, 'Debit must be positive'),
        credit: yup.number().min(0, 'Credit must be positive'),
        description: yup.string().required('Line description is required'),
      })
    )
    .min(2, 'At least two lines are required'),
});

interface JournalSliderProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const JournalSlider: React.FC<JournalSliderProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' },
  ]);
  const [debitCreditError, setDebitCreditError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<JournalPayload>({
    resolver: yupResolver(journalSchema),
    defaultValues: {
      type: 'SALE',
      date: new Date(),
      description: '',
      sourceDocumentType: '',
      lines: [
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' },
      ],
    },
  });

  // Add useEffect for real-time debit/credit validation
  useEffect(() => {
    const totalDebit = lines.reduce(
      (sum, line) => sum + parseFloat(line.debit?.toString() || '0'),
      0
    );
    const totalCredit = lines.reduce(
      (sum, line) => sum + parseFloat(line.credit?.toString() || '0'),
      0
    );

    if (totalDebit !== totalCredit) {
      setDebitCreditError(
        `Total debits (${totalDebit.toFixed(
          2
        )}) must equal total credits (${totalCredit.toFixed(2)})`
      );
    } else {
      setDebitCreditError(null);
    }
  }, [lines]);

  const handleAccountSearch = (value: string) => {
    if (value) {
      searchAccount(value);
    }
  };

  const searchAccount = async (term: string) => {
    try {
      setLoadingAccounts(true);
      const response = await accountsApi.getFiltered({ search: term, limit: 10 });

      // Get currently selected accounts from lines
      const selectedAccounts = lines
        .map((line) => line.accountId)
        .filter((id) => id)
        .map((id) => accounts.find((acc) => acc.uuid === id))
        .filter((acc): acc is Account => acc !== undefined);

      // Combine selected accounts with search results, avoiding duplicates
      const newAccounts = [...selectedAccounts];
      (response.data as Account[]).forEach((account) => {
        if (!newAccounts.some((acc) => acc.uuid === account.uuid)) {
          newAccounts.push(account);
        }
      });

      setAccounts(newAccounts);
    } catch {
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      { accountId: '', debit: 0, credit: 0, description: '' },
    ]);
  };

  const removeLine = (index: number) => {
    const formLines = watch('lines') ?? [];
    const next = lines
      .map((line, i) => ({ ...line, description: formLines[i]?.description ?? line.description }))
      .filter((_, i) => i !== index);
    setLines(next);
    setValue('lines', next);
  };

  const handleAccountChange = (value: string, index: number) => {
    const selectedAccount = accounts.find((account) => account.uuid === value);
    if (selectedAccount) {
      const updatedLines = [...lines];
      updatedLines[index] = {
        ...updatedLines[index],
        accountId: selectedAccount.uuid,
        description: updatedLines[index].description || '',
        debit: updatedLines[index].debit || 0,
        credit: updatedLines[index].credit || 0,
      };
      setLines(updatedLines);
      // Update form value for validation
      setValue(`lines.${index}.accountId`, selectedAccount.uuid);
    }
  };

  const handleDebitChange = (value: string, index: number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      debit: parseFloat(value) || 0,
      credit: 0, // Reset credit when debit is entered
    };
    setLines(updatedLines);
    // Update form value for validation
    setValue(`lines.${index}.debit`, parseFloat(value) || 0);
    setValue(`lines.${index}.credit`, 0);
  };

  const handleCreditChange = (value: string, index: number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      credit: parseFloat(value) || 0,
      debit: 0, // Reset debit when credit is entered
    };
    setLines(updatedLines);
    // Update form value for validation
    setValue(`lines.${index}.credit`, parseFloat(value) || 0);
    setValue(`lines.${index}.debit`, 0);
  };

  const onSubmit = async () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    try {
      const data = watch();
      const payload: CreateJournalPayload = {
        type: data.type,
        date: new Date(data.date).toISOString(),
        description: data.description,
        ...(data.sourceDocumentType ? { sourceDocumentType: data.sourceDocumentType } : {}),
        lines: lines.map((line, index) => {
          const description = data.lines?.[index]?.description || line.description;
          return {
            accountId: line.accountId,
            ...(description ? { description } : {}),
            ...(line.debit > 0 ? { debit: line.debit } : { credit: line.credit }),
          };
        }),
      };
      await journalApi.create(payload);
      toast.success('Journal created successfully');
      queryClient.invalidateQueries({ queryKey: ['get-all-journals'] });
      setIsOpen(false);
      setIsConfirmOpen(false);
      reset();
      setLines([
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' },
      ]);
      setDebitCreditError(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <>
      <Slider
        open={isOpen}
        setOpen={setIsOpen}
        edit={false}
        title="Create Journal Entry"
        buttonText="journal"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative overflow-hidden w-full max-w-6xl h-full"
        >
          <div className="grid grid-cols-2 overflow-hidden min-h-full gap-4 p-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      label="Type"
                      options={[
                        { value: 'SALE', label: 'Sale' },
                        { value: 'PURCHASE', label: 'Purchase' },
                        { value: 'EXPENSE', label: 'Expense' },
                        { value: 'PAYMENT', label: 'Payment' },
                      ]}
                      selectedValue={field.value}
                      onChange={field.onChange}
                      placeholder="Select type..."
                      required
                    />
                  )}
                />
                {errors.type && (
                  <small className="text-destructive">{errors.type.message}</small>
                )}
              </div>

              <div>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <ShadcnButton
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </ShadcnButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && (
                  <small className="text-destructive">{errors.date.message}</small>
                )}
              </div>

              <div>
                <Input
                  label="Description"
                  type="text"
                  name="description"
                  placeholder="Enter description"
                  register={register}
                  errors={errors.description}
                  required
                />
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <div>
                  <Controller
                    name="sourceDocumentType"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Source Document Type"
                        options={[
                          { value: 'INVOICE', label: 'Invoice' },
                          { value: 'RECEIPT', label: 'Receipt' },
                          {
                            value: 'PAYMENT_VOUCHER',
                            label: 'Payment Voucher',
                          },
                          { value: 'EXPENSE_REPORT', label: 'Expense Report' },
                        ]}
                        selectedValue={field.value}
                        onChange={field.onChange}
                        placeholder="Select document type..."
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Journal Lines */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Journal Lines</h3>
                <Button
                  type="button"
                  text="Add Line"
                  onClick={addLine}
                  theme="lightBlue"
                  className="!text-black"
                />
              </div>

              {debitCreditError && (
                <div className="rounded-[2px] border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-destructive text-sm">{debitCreditError}</p>
                </div>
              )}

              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {lines.map((line, index) => (
                  <div key={index} className="dashboard-panel space-y-3 p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Line {index + 1}</h4>
                      {index > 1 && (
                        <Button
                          type="button"
                          text="Remove"
                          onClick={() => removeLine(index)}
                          theme="danger"
                        />
                      )}
                    </div>

                    <Controller
                      name={`lines.${index}.accountId`}
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          label="Account"
                          placeholder="Search by account code"
                          options={accounts.map((account) => ({
                            label: `${account.code || ''} - ${account.name}`,
                            value: account.uuid,
                          }))}
                          selectedValue={line.accountId}
                          onChange={(value) =>
                            handleAccountChange(value, index)
                          }
                          onInputChange={handleAccountSearch}
                          isSearchable={true}
                          isLoading={loadingAccounts}
                          error={errors.lines?.[index]?.accountId?.message}
                        />
                      )}
                    />

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <CurrencyInput
                          label="Debit"
                          value={line.debit?.toString() || '0'}
                          onChange={(e) =>
                            handleDebitChange(e.target.value, index)
                          }
                          error={errors.lines?.[index]?.debit?.message}
                        />
                      </div>
                      <div className="flex-1">
                        <CurrencyInput
                          label="Credit"
                          value={line.credit?.toString() || '0'}
                          onChange={(e) =>
                            handleCreditChange(e.target.value, index)
                          }
                          error={errors.lines?.[index]?.credit?.message}
                        />
                      </div>
                    </div>

                    <Input
                      label="Line Description"
                      type="text"
                      name={`lines.${index}.description`}
                      placeholder="Enter line description"
                      register={register}
                      errors={errors.lines?.[index]?.description}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-grow" />
          <div className="text-center md:text-right md:flex space-x-4 fixed bottom-0 left-0 right-0 justify-center bg-white p-4">
            <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-black/10 flex justify-end space-x-3">
              <Button
                text="Create Journal Entry"
                type="submit"
                disabled={!!debitCreditError}
              />
            </div>
          </div>
        </form>
      </Slider>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] !rounded-none animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle>Confirm Journal Creation</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to create this
              journal entry? Please verify all the details before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              text="Cancel"
              type="button"
              theme="outline"
              onClick={() => setIsConfirmOpen(false)}
            />
            <Button
              text="Create Journal"
              type="button"
              onClick={handleConfirmCreate}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JournalSlider;
