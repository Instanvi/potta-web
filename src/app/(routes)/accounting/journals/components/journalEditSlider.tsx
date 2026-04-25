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
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@potta/lib/utils';
import { accountsApi } from '../../utils/api';
import { journalApi } from '../utils/api';
import toast from 'react-hot-toast';
import { Account } from '../../utils/types';
import CurrencyInput from '@potta/components/currencyInput';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@potta/components/shadcn/dialog';
import { useMutation } from '@tanstack/react-query';

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
  organizationId: string;
  branchId: string;
  sourceDocumentId?: string;
  sourceDocumentType?: string;
  lines: JournalLine[];
}

const journalSchema = yup.object().shape({
  type: yup.string().required('Type is required'),
  date: yup.date().required('Date is required'),
  description: yup.string().required('Description is required'),
  organizationId: yup.string().required('Organization ID is required'),
  branchId: yup.string().required('Branch ID is required'),
  sourceDocumentId: yup.string(),
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

interface JournalEditSliderProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  journalId?: string;
}

const JournalEditSlider: React.FC<JournalEditSliderProps> = ({
  open: controlledOpen,
  setOpen: setControlledOpen,
  journalId,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [lines, setLines] = useState<JournalLine[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [debitCreditError, setDebitCreditError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const isOpen = controlledOpen ?? localOpen;
  const setIsOpen = setControlledOpen ?? setLocalOpen;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JournalPayload>({
    resolver: yupResolver(journalSchema),
    defaultValues: {
      type: 'SALE',
      date: new Date(),
      description: '',
      organizationId: 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3c',
      branchId: 'f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3b',
      sourceDocumentType: '',
      lines: [],
    },
  });

  // Watch all lines for debit/credit changes
  const watchedLines = watch('lines');

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

  // Fetch journal data when opened
  useEffect(() => {
    if (journalId && isOpen) {
      const fetchJournal = async () => {
        try {
          const response = await journalApi.getOne(journalId);
          setValue('type', response.type);
          setValue('date', new Date(response.date));
          setValue('description', response.description);
          setValue('organizationId', response.organizationId);
          setValue('branchId', response.branchId);
          setValue('sourceDocumentId', response.sourceDocumentId);
          setValue('sourceDocumentType', response.sourceDocumentType);
          setValue('lines', response.lines);
          setLines(response.lines);

          // Add accounts from lines to the accounts list
          const lineAccounts = response.lines
            .map((line) => line.account)
            .filter((account): account is Account => account !== undefined);
          setAccounts(lineAccounts);
        } catch (error) {
          console.error('Error fetching journal:', error);
          toast.error('Failed to fetch journal details');
        }
      };
      fetchJournal();
    }
  }, [journalId, isOpen, setValue]);

  const handleAccountSearch = (value: string) => {
    if (value) {
      searchAccount(value);
    }
  };

  const searchAccount = async (code: string) => {
    try {
      setLoadingAccounts(true);
      const response = await accountsApi.getFiltered({
        search: code,
        filter: ['code'],
        limit: 10,
      });

      // Get currently selected accounts from lines
      const selectedAccounts = lines
        .map((line) => line.accountId)
        .filter((id) => id)
        .map((id) => accounts.find((acc) => acc.uuid === id))
        .filter((acc): acc is Account => acc !== undefined);

      // Combine selected accounts with search results, avoiding duplicates
      const newAccounts = [...selectedAccounts];
      response.data.forEach((account) => {
        if (!newAccounts.some((acc) => acc.uuid === account.uuid)) {
          newAccounts.push(account);
        }
      });

      setAccounts(newAccounts);
    } catch (error) {
      console.error('Error searching accounts:', error);
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
    setLines(lines.filter((_, i) => i !== index));
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
      setValue(`lines.${index}.accountId`, selectedAccount.uuid);
    }
  };

  const handleDebitChange = (value: string, index: number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      debit: parseFloat(value) || 0,
      credit: 0,
    };
    setLines(updatedLines);
    setValue(`lines.${index}.debit`, parseFloat(value) || 0);
  };

  const handleCreditChange = (value: string, index: number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      credit: parseFloat(value) || 0,
      debit: 0,
    };
    setLines(updatedLines);
    setValue(`lines.${index}.credit`, parseFloat(value) || 0);
  };

  const handleDescriptionChange = (value: string, index: number) => {
    const updatedLines = [...lines];
    updatedLines[index] = {
      ...updatedLines[index],
      description: value,
    };
    setLines(updatedLines);
    setValue(`lines.${index}.description`, value);
  };

  const updateJournal = useMutation({
    mutationFn: (data: JournalPayload) => journalApi.update(journalId!, data),
    onSuccess: () => {
      toast.success('Journal updated successfully');
      setIsOpen(false);
      setIsConfirmOpen(false);
      queryClient.invalidateQueries({ queryKey: ['get-all-journals'] });
      router.refresh();
    },
    onError: (error) => {
      console.error('Error updating journal:', error);
      toast.error('Failed to update journal');
    },
  });

  const onSubmit = async (data: JournalPayload) => {
    setIsConfirmOpen(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const data = watch();
      const payload = {
        type: data.type,
        date: new Date(data.date).toISOString(),
        description: data.description,
        organizationId: data.organizationId,
        branchId: data.branchId,
        sourceDocumentId: data.sourceDocumentId,
        sourceDocumentType: data.sourceDocumentType,
        lines: data.lines.map((line) => {
          const linePayload: any = {
            accountId: line.accountId,
            description: line.description,
          };

          if (line.debit && line.debit > 0) {
            linePayload.debit = line.debit;
          } else if (line.credit && line.credit > 0) {
            linePayload.credit = line.credit;
          }

          return linePayload;
        }),
      };
      updateJournal.mutate(payload);
    } catch (error) {
      console.error('Error updating journal:', error);
      toast.error('Failed to update journal');
    }
  };

  return (
    <>
      <Slider
        open={isOpen}
        setOpen={setIsOpen}
        edit={true}
        title="Edit Journal Entry"
        buttonText="journal"
      >
        <div className="relative overflow-hidden w-full max-w-6xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={[
                      { value: 'SALE', label: 'Sale' },
                      { value: 'PURCHASE', label: 'Purchase' },
                      { value: 'PAYMENT', label: 'Payment' },
                      { value: 'RECEIPT', label: 'Receipt' },
                      { value: 'EXPENSE', label: 'Expense' },
                    ]}
                    selectedValue={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                {...register('description')}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Journal Lines
              </label>
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="space-y-4 mt-4 p-4 border rounded-lg"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account
                    </label>
                    <Controller
                      name={`lines.${index}.accountId`}
                      control={control}
                      render={({ field }) => (
                        <SearchableSelect
                          options={accounts.map((account) => ({
                            value: account.uuid,
                            label: `${account.code} - ${account.name}`,
                          }))}
                          selectedValue={line.accountId}
                          onChange={(value) =>
                            handleAccountChange(value, index)
                          }
                          onSearch={handleAccountSearch}
                          isLoading={loadingAccounts}
                        />
                      )}
                    />
                    {errors.lines?.[index]?.accountId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lines[index]?.accountId?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Debit
                      </label>
                      <CurrencyInput
                        value={line.debit}
                        onChange={(value) => handleDebitChange(value, index)}
                        name={`lines.${index}.debit`}
                      />
                      {errors.lines?.[index]?.debit && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lines[index]?.debit?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Credit
                      </label>
                      <CurrencyInput
                        value={line.credit}
                        onChange={(value) => handleCreditChange(value, index)}
                        name={`lines.${index}.credit`}
                      />
                      {errors.lines?.[index]?.credit && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lines[index]?.credit?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Input
                      value={line.description}
                      onChange={(e) =>
                        handleDescriptionChange(e.target.value, index)
                      }
                      placeholder="Enter line description"
                    />
                    {errors.lines?.[index]?.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lines[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  {index > 1 && (
                    <Button
                      variant="destructive"
                      onClick={() => removeLine(index)}
                      className="mt-2"
                    >
                      Remove Line
                    </Button>
                  )}
                </div>
              ))}

              <Button onClick={addLine} className="mt-4">
                Add Line
              </Button>

              {debitCreditError && (
                <p className="mt-2 text-sm text-red-600">{debitCreditError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)}>Update Journal</Button>
            </div>
          </div>
        </div>
      </Slider>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this journal entry? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JournalEditSlider;
